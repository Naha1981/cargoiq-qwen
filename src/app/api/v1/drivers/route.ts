import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { drivers, tenants, users } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { normalizePhoneNumber } from "@/lib/utils";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function resolveTenant(userId: string) {
  if (!db) return null;
  const appUser = await db.query.users.findFirst({
    where: eq(users.clerk_id, userId as string),
  });
  if (!appUser) return null;
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, appUser.tenantId),
  });
  return tenant;
}

const createDriverSchema = z.object({
  name: z.string().min(1, "Driver name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
});

export async function POST(request: NextRequest) {
  if (!auth || !db) {
    return NextResponse.json(
      { error: "SERVICE_UNAVAILABLE", message: "Auth or database not configured." },
      { status: 503 }
    );
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = createDriverSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, phoneNumber } = parsed.data;
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    const tenant = await resolveTenant(userId as string);

    if (!tenant) {
      return NextResponse.json(
        { error: "TENANT_NOT_FOUND", message: "Organisation not found." },
        { status: 404 }
      );
    }

    const existingDriver = await db.query.drivers.findFirst({
      where: eq(drivers.phoneNumber, normalizedPhone),
    });

    if (existingDriver) {
      return NextResponse.json(
        { error: "DRIVER_EXISTS", message: "A driver with this phone number already exists." },
        { status: 409 }
      );
    }

    const driver = await db.insert(drivers).values({
      id: generateId(),
      tenantId: tenant.id,
      name,
      phoneNumber: normalizedPhone,
      defaultLocation: (body as Record<string, unknown>).defaultLocation as string | undefined,
      active: true,
    }).returning();

    return NextResponse.json({
      success: true,
      driver: driver[0],
    }, { status: 201 });

  } catch (error) {
    console.error("[Create Driver Error]:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to create driver." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/drivers
 * Tenant-scoped driver list. Tenant derived from authenticated Clerk user,
 * never client-supplied. Returns drivers for the WhatsApp driver-mapping table.
 */
export async function GET() {
  if (!db) {
    return NextResponse.json(
      { error: "SERVICE_UNAVAILABLE", message: "Database not configured." },
      { status: 503 }
    );
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    const tenant = await resolveTenant(userId as string);
    if (!tenant) {
      return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });
    }
    const list = await db.query.drivers.findMany({
      where: eq(drivers.tenantId, tenant.id),
      orderBy: (d, { desc }) => [desc(d.createdAt)],
    });
    return NextResponse.json({ data: list, tenantId: tenant.id });
  } catch (error) {
    console.error("[Drivers GET Error]:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to fetch drivers." },
      { status: 500 }
    );
  }
}
