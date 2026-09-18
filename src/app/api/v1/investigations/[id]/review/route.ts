import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getTenantContext } from "@/modules/investigation/service";
import {
  approveLatestEvidencePack,
  getCaseReviewState,
  resolveContradiction,
  reviewClaim,
} from "@/modules/investigation/review";

type Context = { params: Promise<{ id: string }> };

const reviewSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("VERIFY_CLAIM"),
    claimId: z.string().min(1),
    reason: z.string().trim().max(2000).optional(),
  }),
  z.object({
    action: z.literal("DISPUTE_CLAIM"),
    claimId: z.string().min(1),
    reason: z.string().trim().max(2000).optional(),
  }),
  z.object({
    action: z.literal("RESOLVE_CONTRADICTION"),
    contradictionId: z.string().min(1),
    reason: z.string().trim().max(2000).optional(),
  }),
  z.object({
    action: z.literal("APPROVE_EVIDENCE_PACK"),
    reason: z.string().trim().max(2000).optional(),
  }),
]);

export async function GET(_request: Request, context: Context) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const tenant = await getTenantContext(userId);
  if (!tenant) return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });

  const { id } = await context.params;

  try {
    const data = await getCaseReviewState(tenant.id, id);
    if (!data) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[Investigation review GET]", error);
    return NextResponse.json(
      { error: "REVIEW_STATE_READ_FAILED", message: "Could not load review state." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: Context) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const tenant = await getTenantContext(userId);
  if (!tenant) return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });

  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id: caseId } = await context.params;

  try {
    if (parsed.data.action === "VERIFY_CLAIM") {
      return NextResponse.json({
        data: await reviewClaim({
          tenantId: tenant.id,
          caseId,
          claimId: parsed.data.claimId,
          decision: "VERIFY",
          reviewerUserId: userId,
          reason: parsed.data.reason,
        }),
      });
    }

    if (parsed.data.action === "DISPUTE_CLAIM") {
      return NextResponse.json({
        data: await reviewClaim({
          tenantId: tenant.id,
          caseId,
          claimId: parsed.data.claimId,
          decision: "DISPUTE",
          reviewerUserId: userId,
          reason: parsed.data.reason,
        }),
      });
    }

    if (parsed.data.action === "RESOLVE_CONTRADICTION") {
      return NextResponse.json({
        data: await resolveContradiction({
          tenantId: tenant.id,
          caseId,
          contradictionId: parsed.data.contradictionId,
          reviewerUserId: userId,
          reason: parsed.data.reason,
        }),
      });
    }

    return NextResponse.json({
      data: await approveLatestEvidencePack({
        tenantId: tenant.id,
        caseId,
        reviewerUserId: userId,
        reason: parsed.data.reason,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Review action failed.";
    const status =
      ["NOT_FOUND", "CLAIM_NOT_FOUND", "CONTRADICTION_NOT_FOUND", "EVIDENCE_PACK_NOT_FOUND"].includes(message)
        ? 404
        : message === "UNRESOLVED_CONTRADICTIONS"
          ? 409
          : ["INVALID_PROVENANCE_TRANSITION", "INVALID_CLAIM_PROVENANCE"].includes(message)
            ? 400
            : 500;

    console.error("[Investigation review POST]", error);
    return NextResponse.json({ error: message, message }, { status });
  }
}
