import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getTenantContext, getInvestigationCase } from "@/modules/investigation/service";
import { ingestDemurragePdf } from "@/modules/investigation/documents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const tenant = await getTenantContext(userId);
  if (!tenant) return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });

  const { id } = await context.params;
  const investigation = await getInvestigationCase(tenant.id, id);
  if (!investigation) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "FILE_REQUIRED" }, { status: 400 });
    }

    const result = await ingestDemurragePdf({
      tenantId: tenant.id,
      caseId: id,
      actorUserId: userId,
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        buffer: Buffer.from(await file.arrayBuffer()),
      },
      documentType: "DEMURRAGE_DOCUMENT",
      sourceLabel: String(formData.get("sourceLabel") || "Customer primary source"),
    });

    return NextResponse.json(
      {
        data: {
          documentId: result.document.id,
          versionId: result.version?.id ?? null,
          duplicate: result.duplicate,
          claimsCreated: result.claimsCreated,
          contradictionsCreated: result.contradictionsCreated,
          extraction: result.extraction ?? null,
          inProgress: result.inProgress ?? false,
        },
      },
      { status: result.duplicate ? 200 : 201 },
    );
  } catch (error) {
    console.error("[Investigation document upload]", error);
    const message = error instanceof Error ? error.message : "DOCUMENT_INGESTION_FAILED";
    const status =
      message === "MALWARE_SCAN_NOT_CONFIGURED" || message === "GOOGLE_GENERATIVE_AI_API_KEY_NOT_CONFIGURED"
        ? 503
        : message === "MALWARE_DETECTED"
          ? 422
          : message === "DOCUMENT_EXTRACTION_IN_PROGRESS"
            ? 409
            : 400;
    return NextResponse.json({ error: "DOCUMENT_INGESTION_FAILED", message }, { status });
  }
}
