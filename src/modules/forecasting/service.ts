import { db } from "@/lib/db";
import {
  forecastRuns,
  forecastSignals,
  investigationAuditEvents,
} from "@/lib/db/investigation-schema";
import { generateId } from "@/lib/utils";
import {
  createInvestigationCase,
  getInvestigationCase,
} from "@/modules/investigation/service";
import { buildForecastSignal } from "./risk";
import { createTimesFmEngineFromEnv } from "./timesfm";
import type {
  ForecastInput,
  ForecastSignal,
  ForecastThreshold,
} from "./types";

export interface StoredForecastResult {
  runId: string;
  signalId?: string;
  signal: ForecastSignal | null;
}

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

export async function runAndStoreForecastSignal(input: {
  tenantId: string;
  caseId?: string;
  series: ForecastInput;
  threshold: ForecastThreshold;
}): Promise<StoredForecastResult> {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");

  if (input.caseId) {
    const investigation = await getInvestigationCase(input.tenantId, input.caseId);
    if (!investigation) throw new Error("CASE_NOT_FOUND");
  }

  const engine = createTimesFmEngineFromEnv();
  const result = await engine.forecast(input.series);
  const signal = buildForecastSignal(result, {
    entityType: input.series.entityType,
    entityId: input.series.entityId,
    threshold: input.threshold,
  });

  let caseId = input.caseId;
  if (!caseId && signal) {
    const disputeType =
      input.series.metric.toLowerCase().includes("dwell") ||
      input.series.metric.toLowerCase().includes("demurrage") ||
      input.series.metric.toLowerCase().includes("free_time")
        ? "DEMURRAGE"
        : input.series.metric.toLowerCase().includes("waiting")
          ? "WAITING_TIME"
          : "OTHER";

    const createdCase = await createInvestigationCase(input.tenantId, {
      title: `Forecast investigation — ${input.series.entityId} — ${input.series.metric}`,
      reference: `FORECAST:${input.series.seriesId}`,
      disputeType,
      baseCurrency: input.threshold.currency ?? "ZAR",
      notes: signal.rationale,
      originType: "FORECAST_SIGNAL",
      originId: signal.seriesId,
    });
    caseId = createdCase.id;

    await db.insert(investigationAuditEvents).values({
      id: generateId(),
      tenantId: input.tenantId,
      caseId,
      actorUserId: null,
      action: "FORECAST_SIGNAL_CREATED_CASE",
      targetType: "forecast_signal",
      targetId: signal.seriesId,
      payload: {
        seriesId: signal.seriesId,
        entityType: signal.entityType,
        entityId: signal.entityId,
        metric: signal.metric,
        signalType: signal.signalType,
        score: signal.score,
        provenance: signal.provenance,
      },
      createdAt: new Date(),
    });
  }

  const runId = generateId();
  const now = new Date(result.generatedAt);

  await db.insert(forecastRuns).values({
    id: runId,
    tenantId: input.tenantId,
    caseId: caseId ?? null,
    seriesId: input.series.seriesId,
    entityType: input.series.entityType,
    entityId: input.series.entityId,
    metric: input.series.metric,
    engine: result.engine,
    modelVersion: result.modelVersion,
    frequency: input.series.frequency,
    horizon: String(input.series.horizon),
    generatedAt: now,
    inputSnapshot: input.series,
    output: result.points,
    limitations: result.limitations,
    createdAt: new Date(),
  });

  if (!signal) {
    return { runId, signal: null };
  }

  const signalId = generateId();
  await db.insert(forecastSignals).values({
    id: signalId,
    tenantId: input.tenantId,
    caseId: caseId ?? null,
    forecastRunId: runId,
    seriesId: signal.seriesId,
    entityType: signal.entityType,
    entityId: signal.entityId,
    metric: signal.metric,
    signalType: signal.signalType,
    score: signal.score.toFixed(4),
    triggerThreshold: String(signal.triggerThreshold),
    peakForecastValue: String(signal.peakForecastValue),
    peakUpperValue:
      signal.peakUpperValue === undefined ? null : String(signal.peakUpperValue),
    expectedAmountMinor: signal.expectedAmountMinor ?? null,
    currency: signal.currency ?? null,
    horizonStart: new Date(signal.horizonStart),
    horizonEnd: new Date(signal.horizonEnd),
    rationale: signal.rationale,
    provenance: signal.provenance,
    requiresInvestigation: true,
    status: "NEW",
    limitations: signal.limitations,
    createdAt: new Date(),
  });

  return { runId, signalId, signal };
}
