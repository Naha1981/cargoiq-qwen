import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contradictions, externalObservations } from "@/lib/db/investigation-schema";
import { getTenantContext, getInvestigationCase } from "@/modules/investigation/service";
import { getCaseClaims } from "@/modules/investigation/documents";
import { latestCalculation } from "@/modules/investigation/calculation";
import { verifySceneToken } from "@/modules/investigation/scene-token";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  const { id } = await context.params;
  const token = new URL(request.url).searchParams.get("token");
  const payload = token ? verifySceneToken(token) : null;
  if (!payload || payload.caseId !== id) {
    return NextResponse.json({ error: "INVALID_SCENE_TOKEN" }, { status: 401 });
  }

  const tenantId = process.env.CARGOiQ_GEV_SCENE_TENANT_ID;
  if (!tenantId || !db) {
    return NextResponse.json({ error: "SCENE_NOT_CONFIGURED" }, { status: 503 });
  }

  const investigation = await getInvestigationCase(tenantId, id);
  if (!investigation) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const [claims, contradictionRows, observations, calculation] = await Promise.all([
    getCaseClaims(tenantId, id),
    db.select().from(contradictions).where(and(eq(contradictions.tenantId, tenantId), eq(contradictions.caseId, id))).orderBy(desc(contradictions.createdAt)),
    db.select().from(externalObservations).where(and(eq(externalObservations.tenantId, tenantId), eq(externalObservations.caseId, id))).orderBy(desc(externalObservations.observedAt)),
    latestCalculation(tenantId, id),
  ]);

  const response = NextResponse.json({
    case: {
      id: investigation.id,
      title: investigation.title,
      reference: investigation.reference,
      disputeType: investigation.disputeType,
      status: investigation.status,
      baseCurrency: investigation.baseCurrency,
    },
    claims: claims.map((claim) => ({
      id: claim.id,
      type: claim.claimType,
      text: claim.claimText,
      value: claim.normalizedValue,
      sourceQuote: claim.sourceQuote,
      pageNumber: claim.pageNumber,
      provenance: claim.provenance,
      confidence: claim.confidence,
      observedAt: claim.observedAt,
    })),
    contradictions: contradictionRows,
    observations: observations.map((item) => ({
      id: item.id,
      type: item.observationType,
      observedAt: item.observedAt,
      latitude: item.latitude,
      longitude: item.longitude,
      provenance: item.provenance,
      sourceId: item.sourceId,
      limitation: item.limitation,
      payload: item.payload,
    })),
    calculation,
    scene: {
      focus: "Durban port / case observations",
      visualSource: "CargoIQ case-scoped investigation API",
      evidenceRule: "External observations are corroboration, not automatic proof.",
    },
  });

  response.headers.set("Access-Control-Allow-Origin", process.env.CARGOiQ_GEV_ORIGIN ?? "*");
  response.headers.set("Access-Control-Allow-Headers", "content-type");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", process.env.CARGOiQ_GEV_ORIGIN ?? "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "content-type");
  return response;
}
