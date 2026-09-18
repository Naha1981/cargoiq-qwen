import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getInvestigationCase, getTenantContext } from "@/modules/investigation/service";
import { runCorroboration } from "@/modules/investigation/corroboration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

type Context = { params: Promise<{ id: string }> };

const schema = z.object({
  vesselName: z.string().max(255).optional(),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).default([30.0, -30.0, 31.2, -29.4]),
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export async function POST(request: Request, context: Context) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const tenant = await getTenantContext(userId);
  if (!tenant) return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });

  const { id } = await context.params;
  const investigation = await getInvestigationCase(tenant.id, id);
  if (!investigation) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const raw = await request.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const data = await runCorroboration(tenant.id, id, parsed.data);
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CORROBORATION_FAILED";
    return NextResponse.json({ error: "CORROBORATION_FAILED", message }, { status: 502 });
  }
}
