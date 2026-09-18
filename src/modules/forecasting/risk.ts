import type {
  ForecastResult,
  ForecastSignal,
  ForecastThreshold,
} from "./types.ts";

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function buildForecastSignal(
  result: ForecastResult,
  input: {
    entityType: string;
    entityId: string;
    threshold: ForecastThreshold;
  },
): ForecastSignal | null {
  if (result.points.length === 0) return null;

  const peak = result.points.reduce((best, point) =>
    point.value > best.value ? point : best,
  );

  const peakUpperValue = result.points.reduce((best, point) => {
    const value = point.upper ?? point.value;
    const bestValue = best.upper ?? best.value;
    return value > bestValue ? point : best;
  }).upper ?? undefined;

  const scale = Math.max(Math.abs(input.threshold.scale), 1);
  const observedPeak = peakUpperValue ?? peak.value;
  const excess = Math.max(0, observedPeak - input.threshold.threshold);
  if (excess <= 0) return null;

  const score = clamp(excess / scale);
  const horizonStart = input.threshold.horizonStart;
  const horizonEnd = input.threshold.horizonEnd;

  return {
    seriesId: result.seriesId,
    entityType: input.entityType,
    entityId: input.entityId,
    metric: input.threshold.metric,
    signalType: input.threshold.signalType,
    score,
    triggerThreshold: input.threshold.threshold,
    peakForecastValue: peak.value,
    peakUpperValue,
    expectedAmountMinor: input.threshold.expectedAmountMinor,
    currency: input.threshold.currency,
    horizonStart,
    horizonEnd,
    rationale:
      `Forecast exceeds the configured investigation threshold by ${excess.toFixed(2)} ${input.threshold.metric} units. This is a triage signal, not proof that a charge or event will occur.`,
    provenance: "INFERRED",
    requiresInvestigation: true,
    limitations: [
      ...result.limitations,
      "Forecast output is not evidence of an operational event.",
      "A human-reviewed evidence investigation must establish what actually happened.",
      "Risk score is a deterministic triage heuristic over the forecast output; it is not a probability.",
    ],
  };
}
