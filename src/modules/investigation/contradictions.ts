import { createHash } from "node:crypto";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  contradictions,
  evidenceClaims,
} from "@/lib/db/investigation-schema";
import { generateId } from "@/lib/utils";

type ClaimRow = typeof evidenceClaims.$inferSelect;

function stableValue(value: unknown): string {
  return JSON.stringify(value, Object.keys((value && typeof value === "object") ? value as object : {}).sort());
}

function fingerprint(parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

function comparable(claim: ClaimRow): string | null {
  if (claim.normalizedValue === null || claim.normalizedValue === undefined) return null;
  return typeof claim.normalizedValue === "string"
    ? claim.normalizedValue.trim().toLowerCase()
    : stableValue(claim.normalizedValue);
}

function severityForClaimType(claimType: string): string {
  if (
    claimType.endsWith("_TIME") ||
    claimType === "FREE_DAYS" ||
    claimType === "CHARGED_DAYS" ||
    claimType === "DAILY_RATE" ||
    claimType === "CHARGED_AMOUNT"
  ) return "HIGH";
  return "MEDIUM";
}

export function detectClaimContradictions(claims: ClaimRow[]) {
  const findings: Array<{
    leftClaimId: string;
    rightClaimId: string;
    contradictionType: string;
    explanation: string;
    severity: string;
    fingerprint: string;
  }> = [];

  const groups = new Map<string, ClaimRow[]>();
  for (const claim of claims) {
    const key = claim.claimType;
    const list = groups.get(key) ?? [];
    list.push(claim);
    groups.set(key, list);
  }

  for (const [claimType, list] of groups) {
    const withValues = list
      .map((claim) => ({ claim, value: comparable(claim) }))
      .filter((item): item is { claim: ClaimRow; value: string } => item.value !== null);

    for (let i = 0; i < withValues.length; i += 1) {
      for (let j = i + 1; j < withValues.length; j += 1) {
        if (withValues[i].value === withValues[j].value) continue;
        const a = withValues[i].claim;
        const b = withValues[j].claim;
        const fp = fingerprint([
          "CLAIM_VALUE_CONFLICT",
          claimType,
          ...[a.id, b.id].sort(),
        ]);
        findings.push({
          leftClaimId: a.id,
          rightClaimId: b.id,
          contradictionType: "CLAIM_VALUE_CONFLICT",
          explanation: `Two source-linked claims disagree for ${claimType}: "${a.claimText}" versus "${b.claimText}". CargoIQ preserves both; a human reviewer must resolve which source governs.`,
          severity: severityForClaimType(claimType),
          fingerprint: fp,
        });
      }
    }
  }

  const timeClaims = new Map<string, ClaimRow>();
  for (const claim of claims) {
    if (claim.normalizedValue === null || typeof claim.normalizedValue !== "string") continue;
    if ([
      "ARRIVAL_TIME",
      "DISCHARGE_TIME",
      "AVAILABLE_TIME",
      "FREE_TIME_START",
      "RELEASE_TIME",
    ].includes(claim.claimType)) {
      timeClaims.set(claim.claimType, claim);
    }
  }

  const ordering: Array<[string, string]> = [
    ["ARRIVAL_TIME", "DISCHARGE_TIME"],
    ["DISCHARGE_TIME", "AVAILABLE_TIME"],
    ["AVAILABLE_TIME", "RELEASE_TIME"],
  ];

  for (const [beforeType, afterType] of ordering) {
    const before = timeClaims.get(beforeType);
    const after = timeClaims.get(afterType);
    if (!before || !after) continue;
    const a = new Date(String(before.normalizedValue));
    const b = new Date(String(after.normalizedValue));
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) continue;
    if (b < a) {
      findings.push({
        leftClaimId: before.id,
        rightClaimId: after.id,
        contradictionType: "TIMELINE_ORDER_CONFLICT",
        explanation: `${afterType} occurs before ${beforeType} in the extracted source timeline. The event order must be reviewed.`,
        severity: "HIGH",
        fingerprint: fingerprint([
          "TIMELINE_ORDER_CONFLICT",
          beforeType,
          afterType,
          before.id,
          after.id,
        ]),
      });
    }
  }

  return findings;
}

export async function persistClaimContradictions(
  tenantId: string,
  caseId: string,
) {
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

  const findings = detectClaimContradictions(claims);

  for (const finding of findings) {
    const [existing] = await db
      .select({ id: contradictions.id })
      .from(contradictions)
      .where(
        and(
          eq(contradictions.tenantId, tenantId),
          eq(contradictions.caseId, caseId),
          eq(contradictions.fingerprint, finding.fingerprint),
        ),
      )
      .limit(1);

    if (existing) continue;

    await db.insert(contradictions).values({
      id: generateId(),
      tenantId,
      caseId,
      leftClaimId: finding.leftClaimId,
      rightClaimId: finding.rightClaimId,
      contradictionType: finding.contradictionType,
      explanation: finding.explanation,
      severity: finding.severity,
      resolved: false,
      fingerprint: finding.fingerprint,
      createdAt: new Date(),
    });
  }

  return findings;
}
