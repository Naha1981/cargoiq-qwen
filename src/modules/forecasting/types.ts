export const FORECAST_ENGINE = ["TIMESFM", "STATISTICAL", "CUSTOM"] as const;
export type ForecastEngineName = (typeof FORECAST_ENGINE)[number];

export const FORECAST_SIGNAL_TYPE = [
  "EXPOSURE_RISK",
  "DELAY_RISK",
  "ANOMALY",
] as const;
export type ForecastSignalType = (typeof FORECAST_SIGNAL_TYPE)[number];

export interface ForecastPoint {
  timestamp: string;
  value: number;
  lower?: number;
  upper?: number;
}

export interface ForecastInput {
  seriesId: string;
  entityType: string;
  entityId: string;
  metric: string;
  unit: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "INTRADAY";
  history: Array<{ timestamp: string; value: number }>;
  horizon: number;
  metadata?: Record<string, unknown>;
}

export interface ForecastResult {
  engine: ForecastEngineName;
  modelVersion: string;
  seriesId: string;
  generatedAt: string;
  points: ForecastPoint[];
  limitations: string[];
}

export interface ForecastThreshold {
  metric: string;
  threshold: number;
  scale: number;
  signalType: ForecastSignalType;
  horizonStart: string;
  horizonEnd: string;
  expectedAmountMinor?: string;
  currency?: string;
}

export interface ForecastSignal {
  seriesId: string;
  entityType: string;
  entityId: string;
  metric: string;
  signalType: ForecastSignalType;
  score: number;
  triggerThreshold: number;
  peakForecastValue: number;
  peakUpperValue?: number;
  expectedAmountMinor?: string;
  currency?: string;
  horizonStart: string;
  horizonEnd: string;
  rationale: string;
  provenance: "INFERRED";
  requiresInvestigation: true;
  limitations: string[];
}

export interface ForecastEngine {
  forecast(input: ForecastInput): Promise<ForecastResult>;
}
