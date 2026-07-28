import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { rateCards, tenants, users } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { z } from "zod";
import { eq } from "drizzle-orm";

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
    const all = await db.query.rateCards.findMany({
      where: eq(rateCards.tenantId, tenant.id),
      orderBy: (rc, { desc }) => [desc(rateCards.createdAt)],
    });
    return NextResponse.json({ data: all, tenantId: tenant.id });
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
    const tenant = await resolveTenant(userId);
    if (!tenant) {
      return NextResponse.json({ error: "USER_NOT_FOUND", message: "User profile not found." }, { status: 404 });
    }
    const body = await request.json().catch(() => null);
    const parsed = rateCardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "VALIDATION_ERROR", details: parsed.error.flatten() }, { status: 400 });
    }
    const { carrier, chargeType, route, mode, ratePerKg, ratePerContainer, currency, validFrom, validTo } = parsed.data;
    const now = new Date();
    const card = await db.insert(rateCards).values({
      id: generateId(),
      tenantId: tenant.id,
      carrier,
      chargeType,
      route,
      mode,
      ratePerKg: ratePerKg ? ratePerKg.toString() : null,
      ratePerContainer: ratePerContainer ? ratePerContainer.toString() : null,
      currency,
      validFrom: validFrom ? new Date(validFrom) : now,
      validTo: validTo ? new Date(validTo) : null,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return NextResponse.json({ success: true, rateCard: card[0] }, { status: 201 });
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
    const tenant = await resolveTenant(userId);
    if (!tenant) {
      return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });
    }
    const body = await request.json().catch(() => null);
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "VALIDATION_ERROR", message: "Rate card ID is required." }, { status: 400 });
    }
    const existing = await db.query.rateCards.findFirst({
      where: (rc, { eq, and }) => and(eq(rc.id, id), eq(rc.tenantId, tenant.id)),
    });
    if (!existing) {
      return NextResponse.json({ error: "NOT_FOUND", message: "Rate card not found." }, { status: 404 });
    }
    const updateData: any = { updatedAt: new Date() };
    if (updates.carrier !== undefined) updateData.carrier = updates.carrier;
    if (updates.chargeType !== undefined) updateData.chargeType = updates.chargeType;
    if (updates.route !== undefined) updateData.route = updates.route;
    if (updates.mode !== undefined) updateData.mode = updates.mode;
    if (updates.ratePerKg !== undefined) updateData.ratePerKg = updates.ratePerKg ? updates.ratePerKg.toString() : null;
    if (updates.ratePerContainer !== undefined) updateData.ratePerContainer = updates.ratePerContainer ? updates.ratePerContainer.toString() : null;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.validFrom !== undefined) updateData.validFrom = updates.validFrom ? new Date(updates.validFrom) : null;
    if (updates.validTo !== undefined) updateData.validTo = updates.validTo ? new Date(updates.validTo) : null;
    const updated = await db.update(rateCards).set(updateData).where(eq(rateCards.id, id)).returning();
    return NextResponse.json({ success: true, rateCard: updated[0] });
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
    const tenant = await resolveTenant(userId);
    if (!tenant) {
      return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });
    }
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "VALIDATION_ERROR", message: "Rate card ID is required." }, { status: 400 });
    }
    const existing = await db.query.rateCards.findFirst({
      where: (rc, { eq, and }) => and(eq(rc.id, id), eq(rc.tenantId, tenant.id)),
    });
    if (!existing) {
      return NextResponse.json({ error: "NOT_FOUND", message: "Rate card not found." }, { status: 404 });
    }
    await db.delete(rateCards).where(eq(rateCards.id, id));
    return NextResponse.json({ success: true, message: "Rate card deleted." });
  } catch (error) {
    console.error("[Rate Cards DELETE Error]:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Failed to delete rate card." }, { status: 500 });
  }
}
