import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getInvestigationCase, getTenantContext } from "@/modules/investigation/service";
import { generateEvidencePack, latestEvidencePack } from "@/modules/investigation/evidence-pack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const tenant = await getTenantContext(userId);
  if (!tenant) return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });

  const { id } = await context.params;
  if (!(await getInvestigationCase(tenant.id, id))) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  try {
    const data = await generateEvidencePack(tenant.id, id);
    return new Response(new Uint8Array(data.contentBytes), {
      status: 201,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="cargoiq-${id}-evidence-pack.pdf"`,
        "x-cargoiq-content-sha256": data.contentHash,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "EVIDENCE_PACK_FAILED";
    return NextResponse.json({ error: "EVIDENCE_PACK_FAILED", message }, { status: 500 });
  }
}

export async function GET(_request: Request, context: Context) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const tenant = await getTenantContext(userId);
  if (!tenant) return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });
  const { id } = await context.params;

  const pack = await latestEvidencePack(tenant.id, id);
  if (!pack?.contentBytes) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  return new Response(new Uint8Array(pack.contentBytes), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="cargoiq-${id}-evidence-pack.pdf"`,
      "x-cargoiq-content-sha256": pack.contentHash ?? "",
      "cache-control": "no-store",
    },
  });
}
