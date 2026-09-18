import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getTenantContext } from "@/modules/investigation/service";
import { runAndStoreForecastSignal } from "@/modules/forecasting/service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const requestSchema = z.object({
  series: z.object({
    seriesId: z.string().min(1).max(255),
    entityType: z.string().min(1).max(100),
    entityId: z.string().min(1).max(255),
    metric: z.string().min(1).max(100),
    unit: z.string().min(1).max(50),
    frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "INTRADAY"]),
    history: z.array(
      z.object({
        timestamp: z.string().datetime(),
        value: z.number().finite(),
      }),
    ).min(2).max(20000),
    horizon: z.number().int().min(1).max(1000),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
  caseId: z.string().max(64).optional(),
  threshold: z.object({
    metric: z.string().min(1).max(100),
    threshold: z.number().finite(),
    scale: z.number().finite().positive(),
    signalType: z.enum(["EXPOSURE_RISK", "DELAY_RISK", "ANOMALY"]),
    horizonStart: z.string().datetime(),
    horizonEnd: z.string().datetime(),
    expectedAmountMinor: z.string().regex(/^\d+$/).optional(),
    currency: z.string().regex(/^[A-Z]{3}$/).optional(),
  }),
});

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const tenant = await getTenantContext(userId);
  if (!tenant) {
    return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const stored = await runAndStoreForecastSignal({
      tenantId: tenant.id,
      caseId: parsed.data.caseId,
      series: parsed.data.series,
      threshold: parsed.data.threshold,
    });
    const signal = stored.signal;

    return NextResponse.json({
      data: signal,
      forecastRunId: stored.runId,
      forecastSignalId: stored.signalId ?? null,
      queueAction: signal
        ? {
            action: "CREATE_INVESTIGATION_CANDIDATE",
            status: "INFERRED",
            requiresHumanReview: true,
          }
        : null,
      tenantId: tenant.id,
    });
  } catch (error) {
    console.error("[Forecast signals POST]", error);
    const message = error instanceof Error ? error.message : "FORECAST_FAILED";
    const status = message === "TIMESFM_BASE_URL_NOT_CONFIGURED" ? 503 : 502;

    return NextResponse.json(
      { error: "FORECAST_SIGNAL_FAILED", message },
      { status },
    );
  }
}
