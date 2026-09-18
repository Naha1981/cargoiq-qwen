import { buildForecastSignal } from "./risk";
import { createTimesFmEngineFromEnv } from "./timesfm";
import type {
  ForecastInput,
  ForecastSignal,
  ForecastThreshold,
} from "./types";

export async function forecastInvestigationSignal(input: {
  series: ForecastInput;
  entityType: string;
  entityId: string;
  threshold: ForecastThreshold;
}): Promise<ForecastSignal | null> {
  const engine = createTimesFmEngineFromEnv();
  const result = await engine.forecast(input.series);

  return buildForecastSignal(result, {
    entityType: input.entityType,
    entityId: input.entityId,
    threshold: input.threshold,
  });
}
