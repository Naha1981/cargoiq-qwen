import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  approvals,
  calculationRuns,
  contradictions,
  evidenceClaims,
  evidencePacks,
  investigationAuditEvents,
  investigationCases,
  recoveryAssessments,
} from "@/lib/db/investigation-schema";
import { generateId } from "@/lib/utils";
import { getInvestigationCase } from "./service";
import {
  canTransitionProvenance,
  isProvenanceStatus,
} from "./provenance";
import type { ProvenanceStatus } from "./types";

export async function getCaseReviewState(tenantId: string, caseId: string) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");

  const investigation = await getInvestigationCase(tenantId, caseId);
  if (!investigation) return null;

  const [claims, contradictionRows, calculations, recoveries, packs] = await Promise.all([
    db
      .select()
      .from(evidenceClaims)
      .where(and(eq(evidenceClaims.tenantId, tenantId), eq(evidenceClaims.caseId, caseId)))
      .orderBy(desc(evidenceClaims.createdAt)),
    db
      .select()
      .from(contradictions)
      .where(and(eq(contradictions.tenantId, tenantId), eq(contradictions.caseId, caseId)))
      .orderBy(desc(contradictions.createdAt)),
    db
      .select()
      .from(calculationRuns)
      .where(and(eq(calculationRuns.tenantId, tenantId), eq(calculationRuns.caseId, caseId)))
      .orderBy(desc(calculationRuns.createdAt))
      .limit(5),
    db
      .select()
      .from(recoveryAssessments)
      .where(and(eq(recoveryAssessments.tenantId, tenantId), eq(recoveryAssessments.caseId, caseId)))
      .orderBy(desc(recoveryAssessments.updatedAt))
      .limit(1),
    db
      .select()
      .from(evidencePacks)
      .where(and(eq(evidencePacks.tenantId, tenantId), eq(evidencePacks.caseId, caseId)))
      .orderBy(desc(evidencePacks.createdAt))
      .limit(1),
  ]);

  return {
    investigation,
    claims,
    contradictions: contradictionRows,
    calculations,
    recovery: recoveries[0] ?? null,
    latestPack: packs[0] ?? null,
    reviewSummary: {
      totalClaims: claims.length,
      verifiedClaims: claims.filter((claim) => claim.provenance === "VERIFIED").length,
      pendingClaims: claims.filter((claim) => !claim.humanReviewed).length,
      unresolvedContradictions: contradictionRows.filter((item) => !item.resolved).length,
    },
  };
}

async function loadClaim(tenantId: string, caseId: string, claimId: string) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");
  const [claim] = await db
    .select()
    .from(evidenceClaims)
    .where(
      and(
        eq(evidenceClaims.id, claimId),
        eq(evidenceClaims.tenantId, tenantId),
        eq(evidenceClaims.caseId, caseId),
      ),
    )
    .limit(1);
  return claim ?? null;
}

export async function reviewClaim(input: {
  tenantId: string;
  caseId: string;
  claimId: string;
  decision: "VERIFY" | "DISPUTE";
  reviewerUserId: string;
  reason?: string;
}) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");

  const claim = await loadClaim(input.tenantId, input.caseId, input.claimId);
  if (!claim) throw new Error("CLAIM_NOT_FOUND");

  const target: ProvenanceStatus = input.decision === "VERIFY" ? "VERIFIED" : "DISPUTED";
  const from = claim.provenance;
  if (!isProvenanceStatus(from)) throw new Error("INVALID_CLAIM_PROVENANCE");
  if (!canTransitionProvenance(from, target, input.decision === "VERIFY")) {
    throw new Error("INVALID_PROVENANCE_TRANSITION");
  }

  const now = new Date();
  const [updated] = await db
    .update(evidenceClaims)
    .set({ provenance: target, humanReviewed: true })
    .where(eq(evidenceClaims.id, claim.id))
    .returning();

  await db.insert(approvals).values({
    id: generateId(),
    tenantId: input.tenantId,
    caseId: input.caseId,
    evidencePackId: null,
    reviewerUserId: input.reviewerUserId,
    decision: input.decision === "VERIFY" ? "CLAIM_VERIFIED" : "CLAIM_DISPUTED",
    reason: input.reason?.trim() || null,
    createdAt: now,
  });

  await db.insert(investigationAuditEvents).values({
    id: generateId(),
    tenantId: input.tenantId,
    caseId: input.caseId,
    actorUserId: input.reviewerUserId,
    action: "CLAIM_REVIEWED",
    targetType: "evidence_claim",
    targetId: claim.id,
    payload: { from, to: target, reason: input.reason?.trim() || null },
    createdAt: now,
  });

  return updated;
}

export async function resolveContradiction(input: {
  tenantId: string;
  caseId: string;
  contradictionId: string;
  reviewerUserId: string;
  reason?: string;
}) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");

  const [contradiction] = await db
    .select()
    .from(contradictions)
    .where(
      and(
        eq(contradictions.id, input.contradictionId),
        eq(contradictions.tenantId, input.tenantId),
        eq(contradictions.caseId, input.caseId),
      ),
    )
    .limit(1);

  if (!contradiction) throw new Error("CONTRADICTION_NOT_FOUND");

  const now = new Date();
  const [updated] = await db
    .update(contradictions)
    .set({ resolved: true })
    .where(eq(contradictions.id, contradiction.id))
    .returning();

  await db.insert(investigationAuditEvents).values({
    id: generateId(),
    tenantId: input.tenantId,
    caseId: input.caseId,
    actorUserId: input.reviewerUserId,
    action: "CONTRADICTION_RESOLVED",
    targetType: "contradiction",
    targetId: contradiction.id,
    payload: { reason: input.reason?.trim() || null },
    createdAt: now,
  });

  return updated;
}

export async function approveLatestEvidencePack(input: {
  tenantId: string;
  caseId: string;
  reviewerUserId: string;
  reason?: string;
}) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");

  const state = await getCaseReviewState(input.tenantId, input.caseId);
  if (!state) throw new Error("NOT_FOUND");
  if (!state.latestPack) throw new Error("EVIDENCE_PACK_NOT_FOUND");
  if (state.reviewSummary.unresolvedContradictions > 0) {
    throw new Error("UNRESOLVED_CONTRADICTIONS");
  }

  const now = new Date();
  const [pack] = await db
    .update(evidencePacks)
    .set({ status: "APPROVED" })
    .where(
      and(
        eq(evidencePacks.id, state.latestPack.id),
        eq(evidencePacks.tenantId, input.tenantId),
        eq(evidencePacks.caseId, input.caseId),
      ),
    )
    .returning();

  const [investigation] = await db
    .update(investigationCases)
    .set({ status: "APPROVED", updatedAt: now })
    .where(
      and(
        eq(investigationCases.id, input.caseId),
        eq(investigationCases.tenantId, input.tenantId),
      ),
    )
    .returning();

  await db.insert(approvals).values({
    id: generateId(),
    tenantId: input.tenantId,
    caseId: input.caseId,
    evidencePackId: pack.id,
    reviewerUserId: input.reviewerUserId,
    decision: "EVIDENCE_PACK_APPROVED",
    reason: input.reason?.trim() || null,
    createdAt: now,
  });

  await db.insert(investigationAuditEvents).values({
    id: generateId(),
    tenantId: input.tenantId,
    caseId: input.caseId,
    actorUserId: input.reviewerUserId,
    action: "EVIDENCE_PACK_APPROVED",
    targetType: "evidence_pack",
    targetId: pack.id,
    payload: { reason: input.reason?.trim() || null },
    createdAt: now,
  });

  return { pack, investigation };
}
