import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { investigationDocuments } from "@/lib/db/investigation-schema";
import { getInvestigationCase, getTenantContext } from "@/modules/investigation/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string; documentId: string }> };

export async function GET(_request: Request, context: Context) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const tenant = await getTenantContext(userId);
  if (!tenant) return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });

  const { id, documentId } = await context.params;
  if (!(await getInvestigationCase(tenant.id, id))) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (!db) return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });

  const [document] = await db
    .select()
    .from(investigationDocuments)
    .where(
      and(
        eq(investigationDocuments.id, documentId),
        eq(investigationDocuments.tenantId, tenant.id),
        eq(investigationDocuments.caseId, id),
      ),
    )
    .limit(1);

  if (!document?.contentBytes) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return new Response(new Uint8Array(document.contentBytes), {
    headers: {
      "content-type": document.mimeType,
      "content-disposition": `inline; filename="${document.fileName}"`,
      "x-cargoiq-sha256": document.sha256,
      "x-cargoiq-immutable": String(document.immutable),
      "cache-control": "no-store",
    },
  });
}
