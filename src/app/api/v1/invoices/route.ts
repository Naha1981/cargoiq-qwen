import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getTenantForUser } from "@/lib/tenant/for-user";
import { listInvoicesForTenant, createInvoice } from "@/modules/revenue/service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "SERVICE_UNAVAILABLE", message: "Auth or database not configured." }, { status: 503 });
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    const resolved = await getTenantForUser(userId);
    if (!resolved) {
      return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });
    }
    const body = await request.json().catch(() => null);
    const { tenantName, lineItems, totalAmountZar, dueDate, findingId } = body ?? {};

    if (!tenantName || !lineItems || !totalAmountZar) {
      return NextResponse.json({ error: "VALIDATION_ERROR", message: "tenantName, lineItems, and totalAmountZar are required." }, { status: 400 });
    }

    const invoice = await createInvoice(resolved.tenant.id, { tenantName, lineItems, totalAmountZar, dueDate, findingId });
    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (error) {
    console.error("[Invoice POST Error]:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Failed to create invoice." }, { status: 500 });
  }
}

export async function GET() {
  if (!db) {
    return NextResponse.json({ error: "SERVICE_UNAVAILABLE", message: "Database not configured." }, { status: 503 });
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    const resolved = await getTenantForUser(userId);
    if (!resolved) {
      return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });
    }
    const all = await listInvoicesForTenant(resolved.tenant.id);
    return NextResponse.json({ data: all, tenantId: resolved.tenant.id });
  } catch (error) {
    console.error("[Invoices GET Error]:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Failed to fetch invoices." }, { status: 500 });
  }
}
