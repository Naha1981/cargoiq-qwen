import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getInvestigationCase, getTenantContext } from "@/modules/investigation/service";
import { calculateCaseDemurrage } from "@/modules/investigation/calculation";
import { persistClaimContradictions } from "@/modules/investigation/contradictions";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const tenant = await getTenantContext(userId);
  if (!tenant) return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });

  const { id } = await context.params;
  const investigation = await getInvestigationCase(tenant.id, id);
  if (!investigation) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  try {
    const data = await calculateCaseDemurrage(tenant.id, id);
    const contradictions = await persistClaimContradictions(tenant.id, id);
    return NextResponse.json({ data, contradictionsDetected: contradictions.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CALCULATION_FAILED";
    return NextResponse.json({ error: "CALCULATION_FAILED", message }, { status: 422 });
  }
}
