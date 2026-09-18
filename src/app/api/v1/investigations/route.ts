import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  createInvestigationCase,
  getTenantContext,
  listInvestigationCases,
} from "@/modules/investigation/service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const createCaseSchema = z.object({
  title: z.string().trim().min(3).max(255),
  reference: z.string().trim().max(255).optional(),
  disputeType: z.enum([
    "DEMURRAGE",
    "DETENTION",
    "STORAGE",
    "WAITING_TIME",
    "ACCESSORIAL",
    "CARRIER_OVERCHARGE",
    "OTHER",
  ]),
  baseCurrency: z.string().regex(/^[A-Z]{3}$/).default("ZAR"),
  notes: z.string().max(5000).optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const tenant = await getTenantContext(userId);
  if (!tenant) {
    return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });
  }

  try {
    const data = await listInvestigationCases(tenant.id);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[Investigations GET]", error);
    return NextResponse.json(
      { error: "INVESTIGATION_READ_FAILED", message: "Could not load investigations." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const tenant = await getTenantContext(userId);
  if (!tenant) {
    return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createCaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const created = await createInvestigationCase(tenant.id, parsed.data);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("[Investigations POST]", error);
    return NextResponse.json(
      { error: "INVESTIGATION_CREATE_FAILED", message: "Could not create the investigation." },
      { status: 500 },
    );
  }
}
