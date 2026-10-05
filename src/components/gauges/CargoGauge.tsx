"use client"

import type { ReactNode } from "react"
import {
  Gauge,
  GaugeArc,
  GaugeHub,
  GaugeNeedle,
  GaugeText,
  GaugeTicks,
  GaugeTrack,
  GaugeValue,
  GaugeZones,
  zoneColor,
} from "@/components/gauge"
import { cn } from "@/lib/utils"

export type CargoGaugeStatus = "healthy" | "watch" | "attention" | "critical"
export type CargoGaugeSize = "compact" | "standard" | "large"

export type CargoGaugeZone = {
  to: number
  color: string
}

export type CargoGaugeProps = {
  value: number | null
  min?: number
  max?: number
  label: string
  unit?: string
  status: CargoGaugeStatus
  zones: CargoGaugeZone[]
  size?: CargoGaugeSize
  className?: string
  children?: ReactNode
  accessibleDescription?: string
}

const statusColor: Record<CargoGaugeStatus, string> = {
  healthy: "var(--success)",
  watch: "var(--warn)",
  attention: "var(--secondary)",
  critical: "var(--error)",
}

const sizeClasses: Record<CargoGaugeSize, string> = {
  compact: "w-[150px] max-w-full",
  standard: "w-[210px] max-w-full",
  large: "w-[280px] max-w-full",
}

export function CargoGauge({
  value,
  min = 0,
  max = 100,
  label,
  unit = "",
  status,
  zones,
  size = "standard",
  className,
  children,
  accessibleDescription,
}: CargoGaugeProps) {
  const isValid =
    value !== null &&
    Number.isFinite(value) &&
    Number.isFinite(min) &&
    Number.isFinite(max) &&
    min < max &&
    value >= min &&
    value <= max

  if (!isValid) {
    return (
      <div
        className={cn(
          "flex min-h-[84px] items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--surface-container-low)] px-4 py-3",
          sizeClasses[size],
          className,
        )}
        role="img"
        aria-label={accessibleDescription ?? `${label}: unavailable`}
      >
        <div className="text-center">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--outline-text)]">
            {label}
          </p>
          <p className="mt-1 text-xs font-semibold text-[var(--on-surface-variant)]">
            No valid value
          </p>
        </div>
      </div>
    )
  }

  const activeColor = zoneColor(zones, value, statusColor[status])

  return (
    <figure
      className={cn("min-w-0", sizeClasses[size], className)}
      aria-label={
        accessibleDescription ??
        `${label}: ${value.toFixed(0)}${unit}, ${status}`
      }
    >
      <Gauge
        value={value}
        min={min}
        max={max}
        startAngle={45}
        endAngle={315}
        fit="content"
        padding={34}
        transition={{ type: "spring", visualDuration: 0.35, bounce: 0.08 }}
        className="mx-auto block h-auto w-full"
        style={{ color: "var(--outline)" }}
        role="img"
        aria-hidden="true"
      >
        <GaugeTrack width={10} color="currentColor" opacity={0.15} />
        <GaugeZones zones={zones} width={10} opacity={0.55} gap={1.5} />
        <GaugeArc width={10} color={activeColor} cap="round" />
        <GaugeTicks count={5} length={8} width={1.5} color="var(--outline-text)" opacity={0.7} />
        <GaugeNeedle
          style="pointer"
          width={4}
          length={0.78}
          tail={16}
          color={activeColor}
          tailColor="var(--outline-text)"
        />
        <GaugeHub radius={7} color="var(--on-surface)" />
        <GaugeValue
          decimals={0}
          fontSize={42}
          weight="semibold"
          y={2}
          color="var(--on-surface)"
        />
        <GaugeText
          y={28}
          fontSize={11}
          weight="medium"
          color="var(--outline-text)"
          className="uppercase tracking-[0.12em]"
        >
          {label}{unit ? ` · ${unit}` : ""}
        </GaugeText>
        {children}
      </Gauge>
      <figcaption className="sr-only">
        {accessibleDescription ?? `${label}: ${value.toFixed(0)}${unit}, ${status}`}
      </figcaption>
    </figure>
  )
}
