import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getInvestigationCase,
  getTenantContext,
  listCaseObservations,
} from "@/modules/investigation/service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const tenant = await getTenantContext(userId);
  if (!tenant) {
    return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });
  }

  const { id } = await context.params;
  try {
    const investigation = await getInvestigationCase(tenant.id, id);
    if (!investigation) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    const observations = await listCaseObservations(tenant.id, id);

    return NextResponse.json({
      caseId: id,
      visualSystem: "gods-eye-view",
      entities: observations.map((item) => ({
        entityId: item.id,
        caseId: item.caseId,
        observationType: item.observationType,
        observedAt: item.observedAt,
        retrievedAt: item.retrievedAt,
        latitude: item.latitude,
        longitude: item.longitude,
        provenance: item.provenance,
        confidence: item.confidence,
        sourceId: item.sourceId,
        limitation: item.limitation,
        payload: item.payload,
      })),
      sourceState: observations.length
        ? "LIVE_CASE_DATA"
        : "NO_CASE_OBSERVATIONS",
      limitations: [
        "External observations are corroboration, not automatic proof of shipment-specific responsibility.",
        "AIS, satellite, weather, traffic and public camera observations must retain source-specific limitations.",
      ],
    });
  } catch (error) {
    console.error("[Investigation Geospatial GET]", error);
    return NextResponse.json(
      { error: "GEOSPATIAL_READ_FAILED", message: "Could not load investigation geospatial evidence." },
      { status: 500 },
    );
  }
}
