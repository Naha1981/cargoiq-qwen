import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { invoices, tenants, users, waitingTimeFindings } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function resolveTenant(userId: string) {
  if (!db) return null;
  const appUser = await db.query.users.findFirst({
    where: eq(users.clerk_id, userId),
  });
  if (!appUser) return null;
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, appUser.tenantId),
  });
  return tenant;
}

export async function POST(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "SERVICE_UNAVAILABLE", message: "Auth or database not configured." }, { status: 503 });
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    const tenant = await resolveTenant(userId);
    if (!tenant) {
      return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });
    }
    const body = await request.json().catch(() => null);
    const { findingId, tenantName, lineItems, totalAmountZar, dueDate } = body ?? {};

    if (!tenantName || !lineItems || !totalAmountZar) {
      return NextResponse.json({ error: "VALIDATION_ERROR", message: "tenantName, lineItems, and totalAmountZar are required." }, { status: 400 });
    }

    const reference = `INV-${Date.now()}`;
    const invoice = await db.insert(invoices).values({
      id: generateId(),
      tenantId: tenant.id,
      reference,
      tenantName,
      lineItems: JSON.stringify(lineItems),
      totalAmountZar: totalAmountZar.toString(),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "draft",
      createdAt: new Date(),
    }).returning();

    return NextResponse.json({ success: true, invoice: invoice[0] }, { status: 201 });
  } catch (error) {
    console.error("[Invoice POST Error]:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Failed to create invoice." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "SERVICE_UNAVAILABLE", message: "Database not configured." }, { status: 503 });
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    const tenant = await resolveTenant(userId);
    if (!tenant) {
      return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });
    }
    const all = await db.query.invoices.findMany({
      where: eq(invoices.tenantId, tenant.id),
      orderBy: (inv, { desc }) => [desc(inv.createdAt)],
    });
    return NextResponse.json({ data: all, tenantId: tenant.id });
  } catch (error) {
    console.error("[Invoices GET Error]:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Failed to fetch invoices." }, { status: 500 });
  }
}
