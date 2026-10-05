export function normalizeGaugeValue(
  value: number | string | null | undefined,
  min: number,
  max: number,
): number | null {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return null
  const numeric = typeof value === "string" && value.trim() !== "" ? Number(value) : value
  if (typeof numeric !== "number" || !Number.isFinite(numeric)) return null
  return Math.min(max, Math.max(min, numeric))
}

/**
 * CargoIQ stores evidence confidence as a decimal in the [0, 1] interval.
 * The UI renders that persisted model-output confidence as a percentage.
 * Values outside the contract are rejected instead of silently reinterpreted.
 */
export function confidenceToPercent(
  confidence: number | string | null | undefined,
): number | null {
  const numeric = typeof confidence === "string" && confidence.trim() !== ""
    ? Number(confidence)
    : confidence

  if (typeof numeric !== "number" || !Number.isFinite(numeric)) return null
  if (numeric < 0 || numeric > 1) return null
  return numeric * 100
}

export function confidenceStatus(
  percent: number | null,
): "healthy" | "watch" | "attention" | "critical" {
  if (percent === null || !Number.isFinite(percent)) return "critical"
  if (percent >= 80) return "healthy"
  if (percent >= 60) return "watch"
  if (percent >= 40) return "attention"
  return "critical"
}
