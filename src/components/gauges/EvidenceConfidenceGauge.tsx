"use client"

import { CargoGauge, type CargoGaugeSize } from "./CargoGauge"
import { confidenceStatus, confidenceToPercent } from "./gauge-utils"

type Props = {
  confidence: number | string | null | undefined
  size?: CargoGaugeSize
}

const zones = [
  { to: 40, color: "var(--error)" },
  { to: 60, color: "var(--secondary)" },
  { to: 80, color: "var(--warn)" },
  { to: 100, color: "var(--success)" },
]

export function EvidenceConfidenceGauge({ confidence, size = "compact" }: Props) {
  const percent = confidenceToPercent(confidence)
  const status = confidenceStatus(percent)

  return (
    <CargoGauge
      value={percent}
      min={0}
      max={100}
      label="Extraction confidence"
      unit="%"
      status={status}
      zones={zones}
      size={size}
      accessibleDescription={
        percent === null
          ? "Extraction confidence unavailable. CargoIQ stores model confidence from 0 to 1."
          : `Extraction confidence: ${percent.toFixed(0)} percent. This is model output confidence, not verification of the underlying fact.`
      }
    />
  )
}
