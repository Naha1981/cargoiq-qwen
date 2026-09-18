import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  calculationRuns,
  evidenceClaims,
  recoveryAssessments,
} from "@/lib/db/investigation-schema";
import { generateId } from "@/lib/utils";
import { calculateDemurrage } from "./demurrage";

type ClaimRow = typeof evidenceClaims.$inferSelect;

function latestClaim(claims: ClaimRow[], type: string): ClaimRow | undefined {
  return claims
    .filter((claim) => claim.claimType === type)
    .sort((a, b) => {
      const ad = a.createdAt?.getTime() ?? 0;
      const bd = b.createdAt?.getTime() ?? 0;
      return bd - ad;
    })[0];
}

function stringValue(claim: ClaimRow | undefined): string | undefined {
  const value = claim?.normalizedValue;
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

function numberValue(claim: ClaimRow | undefined): number | undefined {
  const value = claim?.normalizedValue;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

import { moneyToMinor } from "./money.ts";

export async function calculateCaseDemurrage(tenantId: string, caseId: string) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");

  const claims = await db
    .select()
    .from(evidenceClaims)
    .where(
      and(
        eq(evidenceClaims.tenantId, tenantId),
        eq(evidenceClaims.caseId, caseId),
      ),
    );

  const start =
    stringValue(latestClaim(claims, "FREE_TIME_START")) ??
    stringValue(latestClaim(claims, "AVAILABLE_TIME"));
  const release = stringValue(latestClaim(claims, "RELEASE_TIME"));
  const freeDays = numberValue(latestClaim(claims, "FREE_DAYS"));
  const dailyRate = moneyToMinor(latestClaim(claims, "DAILY_RATE")?.normalizedValue);
  const currency = stringValue(latestClaim(claims, "CURRENCY"));
  const chargedAmount = moneyToMinor(latestClaim(claims, "CHARGED_AMOUNT")?.normalizedValue);

  if (!start || !release || freeDays === undefined || dailyRate === undefined || !currency) {
    throw new Error("INSUFFICIENT_DEMURRAGE_EVIDENCE");
  }

  const startDate = new Date(start);
  const releaseDate = new Date(release);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(releaseDate.getTime())) {
    throw new Error("INVALID_DEMURRAGE_DATES");
  }

  const input = {
    chargeStart: startDate.toISOString().slice(0, 10),
    chargeEnd: releaseDate.toISOString().slice(0, 10),
    freeDays: Math.trunc(freeDays),
    dailyRateMinor: Math.trunc(dailyRate),
    currency: currency.toUpperCase(),
    weekendBillable: false,
  } as const;

  const result = calculateDemurrage(input);

  const now = new Date();
  const runId = generateId();
  await db.insert(calculationRuns).values({
    id: runId,
    tenantId,
    caseId,
    ruleId: null,
    ruleVersion: null,
    formulaVersion: "demurrage-v1",
    inputClaimIds: claims.map((claim) => claim.id),
    inputSnapshot: input,
    result,
    assumptions: result.assumptions,
    createdAt: now,
  });

  const chargedAmountMinor =
    chargedAmount === undefined ? null : String(chargedAmount);
  const calculatedAmountMinor = String(result.amountMinor);
  const potentialRecovery =
    chargedAmount === undefined
      ? null
      : String(Math.max(0, Math.trunc(chargedAmount) - result.amountMinor));

  const existingAssessment = await db
    .select({ id: recoveryAssessments.id })
    .from(recoveryAssessments)
    .where(
      and(
        eq(recoveryAssessments.tenantId, tenantId),
        eq(recoveryAssessments.caseId, caseId),
      ),
    )
    .limit(1);

  if (existingAssessment[0]) {
    await db
      .update(recoveryAssessments)
      .set({
        chargedAmountMinor: chargedAmountMinor ?? "0",
        calculatedAmountMinor,
        evidenceSupportedAmountMinor: calculatedAmountMinor,
        potentialRecoveryAmountMinor: potentialRecovery,
        currency: currency.toUpperCase(),
        status: "DRAFT",
        updatedAt: now,
      })
      .where(eq(recoveryAssessments.id, existingAssessment[0].id));
  } else {
    await db.insert(recoveryAssessments).values({
      id: generateId(),
      tenantId,
      caseId,
      chargedAmountMinor: chargedAmountMinor ?? "0",
      calculatedAmountMinor,
      evidenceSupportedAmountMinor: calculatedAmountMinor,
      potentialRecoveryAmountMinor: potentialRecovery,
      recoveredAmountMinor: null,
      currency: currency.toUpperCase(),
      status: "DRAFT",
      createdAt: now,
      updatedAt: now,
    });
  }

  return { runId, input, result, chargedAmountMinor, potentialRecovery };
}

export async function latestCalculation(tenantId: string, caseId: string) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");
  const [row] = await db
    .select()
    .from(calculationRuns)
    .where(
      and(
        eq(calculationRuns.tenantId, tenantId),
        eq(calculationRuns.caseId, caseId),
      ),
    )
    .orderBy(desc(calculationRuns.createdAt))
    .limit(1);
  return row ?? null;
}
