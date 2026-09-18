import { createHash } from "node:crypto";

type ClaimForContradiction = {
  id: string;
  claimType: string;
  claimText: string;
  normalizedValue: unknown;
  observedAt: Date | null;
};

function stableValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  return typeof value === "string" ? value.trim().toLowerCase() : JSON.stringify(value);
}

function fingerprint(parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

function comparable(claim: ClaimForContradiction): string | null {
  if (claim.normalizedValue === null || claim.normalizedValue === undefined) return null;
  return stableValue(claim.normalizedValue);
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

export function detectClaimContradictions(claims: ClaimForContradiction[]) {
  const findings: Array<{
    leftClaimId: string;
    rightClaimId: string;
    contradictionType: string;
    explanation: string;
    severity: string;
    fingerprint: string;
  }> = [];

  const groups = new Map<string, ClaimForContradiction[]>();
  for (const claim of claims) {
    const list = groups.get(claim.claimType) ?? [];
    list.push(claim);
    groups.set(claim.claimType, list);
  }

  for (const [claimType, list] of groups) {
    const withValues = list
      .map((claim) => ({ claim, value: comparable(claim) }))
      .filter((item): item is { claim: ClaimForContradiction; value: string } => item.value !== null);

    for (let i = 0; i < withValues.length; i += 1) {
      for (let j = i + 1; j < withValues.length; j += 1) {
        if (withValues[i].value === withValues[j].value) continue;
        const a = withValues[i].claim;
        const b = withValues[j].claim;
        findings.push({
          leftClaimId: a.id,
          rightClaimId: b.id,
          contradictionType: "CLAIM_VALUE_CONFLICT",
          explanation: `Two source-linked claims disagree for ${claimType}: "${a.claimText}" versus "${b.claimText}". CargoIQ preserves both; a human reviewer must resolve which source governs.`,
          severity: severityForClaimType(claimType),
          fingerprint: fingerprint(["CLAIM_VALUE_CONFLICT", claimType, ...[a.id, b.id].sort()]),
        });
      }
    }
  }

  const timeClaims = new Map<string, ClaimForContradiction>();
  for (const claim of claims) {
    if (typeof claim.normalizedValue !== "string") continue;
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
        fingerprint: fingerprint(["TIMELINE_ORDER_CONFLICT", beforeType, afterType, before.id, after.id]),
      });
    }
  }

  return findings;
}
