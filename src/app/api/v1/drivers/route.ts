import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { drivers, tenants, users } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { normalizePhoneNumber } from "@/lib/utils";
import { z } from "zod";
import { eq } from "drizzle-orm";

const createDriverSchema = z.object({
  name: z.string().min(1, "Driver name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
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

    const appUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "USER_NOT_FOUND", message: "User profile not found." },
        { status: 404 }
      );
    }

    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, appUser.tenantId),
    });

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
