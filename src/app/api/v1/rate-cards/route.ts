import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { getTenantForUser } from "@/lib/tenant/for-user";
import {
  listRateCardsForTenant,
  createRateCard,
  getRateCardForTenant,
  updateRateCardForTenant,
  deleteRateCardForTenant,
} from "@/modules/revenue/service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const rateCardSchema = z.object({
  carrier: z.string().min(1, "Carrier is required"),
  chargeType: z.string().min(1, "Charge type is required"),
  route: z.string().min(1, "Route is required"),
  mode: z.enum(["per_kg", "per_container", "per_unit"]).optional().default("per_container"),
  ratePerKg: z.number().positive().optional(),
  ratePerContainer: z.number().positive().optional(),
  currency: z.string().length(3).default("USD"),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
});

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
    const all = await listRateCardsForTenant(resolved.tenant.id);
    return NextResponse.json({ data: all, tenantId: resolved.tenant.id });
  } catch (error) {
    console.error("[Rate Cards GET Error]:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Failed to fetch rate cards." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "SERVICE_UNAVAILABLE", message: "Auth or database not configured." }, { status: 503 });
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const resolved = await getTenantForUser(userId);
    if (!resolved) {
      return NextResponse.json({ error: "USER_NOT_FOUND", message: "User profile not found." }, { status: 404 });
    }
    const body = await request.json().catch(() => null);
    const parsed = rateCardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "VALIDATION_ERROR", details: parsed.error.flatten() }, { status: 400 });
    }
    const card = await createRateCard(resolved.tenant.id, parsed.data);
    return NextResponse.json({ success: true, rateCard: card }, { status: 201 });
  } catch (error) {
    console.error("[Rate Cards POST Error]:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Failed to create rate card." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "SERVICE_UNAVAILABLE", message: "Auth or database not configured." }, { status: 503 });
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const resolved = await getTenantForUser(userId);
    if (!resolved) {
      return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });
    }
    const body = await request.json().catch(() => null);
    const { id, ...updates } = body ?? {};
    if (!id) {
      return NextResponse.json({ error: "VALIDATION_ERROR", message: "Rate card ID is required." }, { status: 400 });
    }
    const existing = await getRateCardForTenant(id, resolved.tenant.id);
    if (!existing) {
      return NextResponse.json({ error: "NOT_FOUND", message: "Rate card not found." }, { status: 404 });
    }
    const updated = await updateRateCardForTenant(id, resolved.tenant.id, updates);
    return NextResponse.json({ success: true, rateCard: updated });
  } catch (error) {
    console.error("[Rate Cards PUT Error]:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Failed to update rate card." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "SERVICE_UNAVAILABLE", message: "Auth or database not configured." }, { status: 503 });
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const resolved = await getTenantForUser(userId);
    if (!resolved) {
      return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });
    }
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "VALIDATION_ERROR", message: "Rate card ID is required." }, { status: 400 });
    }
    const existing = await getRateCardForTenant(id, resolved.tenant.id);
    if (!existing) {
      return NextResponse.json({ error: "NOT_FOUND", message: "Rate card not found." }, { status: 404 });
    }
    await deleteRateCardForTenant(id, resolved.tenant.id);
    return NextResponse.json({ success: true, message: "Rate card deleted." });
  } catch (error) {
    console.error("[Rate Cards DELETE Error]:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Failed to delete rate card." }, { status: 500 });
  }
}
