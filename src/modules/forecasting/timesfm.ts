import type {
  ForecastEngine,
  ForecastInput,
  ForecastResult,
} from "./types";

interface TimesFmResponse {
  modelVersion?: string;
  points?: Array<{
    timestamp: string;
    value: number;
    lower?: number;
    upper?: number;
  }>;
  limitations?: string[];
}

export class TimesFmHttpEngine implements ForecastEngine {
  private readonly baseUrl: string;
  private readonly token?: string;

  constructor(config: { baseUrl: string; token?: string }) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.token = config.token;
  }

  async forecast(input: ForecastInput): Promise<ForecastResult> {
    const response = await fetch(`${this.baseUrl}/v1/forecast`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`TIMESFM_PROVIDER_ERROR_${response.status}`);
    }

    const payload = (await response.json()) as TimesFmResponse;
    if (!Array.isArray(payload.points)) {
      throw new Error("TIMESFM_INVALID_RESPONSE");
    }

    for (const point of payload.points) {
      if (!point.timestamp || !Number.isFinite(point.value)) {
        throw new Error("TIMESFM_INVALID_POINT");
      }
    }

    return {
      engine: "TIMESFM",
      modelVersion: payload.modelVersion ?? "UNKNOWN",
      seriesId: input.seriesId,
      generatedAt: new Date().toISOString(),
      points: payload.points,
      limitations: [
        "TimesFM is used for prioritisation and forecasting, not evidentiary proof.",
        ...(payload.limitations ?? []),
      ],
    };
  }
}

export function createTimesFmEngineFromEnv(): TimesFmHttpEngine {
  const baseUrl = process.env.TIMESFM_BASE_URL;
  if (!baseUrl) throw new Error("TIMESFM_BASE_URL_NOT_CONFIGURED");

  return new TimesFmHttpEngine({
    baseUrl,
    token: process.env.TIMESFM_API_TOKEN,
  });
}
