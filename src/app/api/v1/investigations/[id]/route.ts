import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getInvestigationCase,
  getTenantContext,
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
    const data = await getInvestigationCase(tenant.id, id);
    if (!data) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[Investigation GET]", error);
    return NextResponse.json(
      { error: "INVESTIGATION_READ_FAILED", message: "Could not load the investigation." },
      { status: 500 },
    );
  }
}
