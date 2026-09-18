import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  contradictions,
  evidenceClaims,
} from "@/lib/db/investigation-schema";
import { generateId } from "@/lib/utils";
export { detectClaimContradictions } from "./contradictions-core.ts";

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
