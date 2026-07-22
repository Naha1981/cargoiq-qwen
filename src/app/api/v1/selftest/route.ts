import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tenants, drivers, waitingTimeFindings } from "@/lib/db/schema";
import { generateId, normalizePhoneNumber } from "@/lib/utils";
import { eq, and, isNull } from "drizzle-orm";

const SELFTEST_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const testPhone = typeof body?.phone === "string" ? body.phone : "27821234567";
    const reference = typeof body?.reference === "string" ? body.reference : "SELFTEST-REF-001";

    const normalizedPhone = normalizePhoneNumber(testPhone);

    let tenant = await db.query.tenants.findFirst({
      where: (tenants, { eq }) => eq(tenants.id, SELFTEST_TENANT_ID),
    });

    if (!tenant) {
      const [created] = await db.insert(tenants).values({
        id: SELFTEST_TENANT_ID,
        name: "Selftest Tenant",
        plan: "trial",
        status: "active",
      }).returning();
      tenant = created;
    }

    let driver = await db.query.drivers.findFirst({
      where: (drivers, { eq }) => eq(drivers.phoneNumber, normalizedPhone),
    });

    if (!driver) {
      const [created] = await db.insert(drivers).values({
        id: generateId(),
        tenantId: SELFTEST_TENANT_ID,
        name: "Selftest Driver",
        phoneNumber: normalizedPhone,
        active: true,
      }).returning();
      driver = created;
    }

    const now = new Date();
    const arrivedAt = new Date(now.getTime() - 130 * 60 * 1000);
    const departedAt = new Date(now.getTime());

    const existing = await db.query.waitingTimeFindings.findFirst({
      where: and(
        eq(waitingTimeFindings.tenantId, SELFTEST_TENANT_ID),
        eq(waitingTimeFindings.reference, reference),
        isNull(waitingTimeFindings.departedAt)
      ),
    });

    if (existing) {
      await db.update(waitingTimeFindings).set({
        departedAt,
        totalMinutes: 130,
        billableMinutes: 10,
        billableAmountZar: "18.33",
        status: "billable",
      }).where(eq(waitingTimeFindings.id, existing.id));
    } else {
      await db.insert(waitingTimeFindings).values({
        id: generateId(),
        tenantId: SELFTEST_TENANT_ID,
        driverId: driver.id,
        reference,
        location: "Selftest Location",
        arrivedAt,
        departedAt,
        totalMinutes: 130,
        freeTimeMinutes: 120,
        billableMinutes: 10,
        ratePerHourZar: "1100.00",
        billableAmountZar: "18.33",
        status: "billable",
      }).returning();
    }

    const billableMinutes = 10;
    const billableAmount = (10 * (1100 / 60)).toFixed(2);
    const emailWouldFire = billableMinutes > 0;

    return NextResponse.json({
      success: true,
      devRoute: "POST /api/v1/selftest",
      scenario: {
        reference,
        phone: normalizedPhone,
        totalMinutes: 130,
        freeTimeMinutes: 120,
        billableMinutes,
        billableAmountZar: billableAmount,
        ratePerHourZar: "1100.00",
        emailWouldFire,
      },
      tenant: { id: tenant.id, name: tenant.name },
      driver: { id: driver.id, name: driver.name, phoneNumber: driver.phoneNumber },
    });

  } catch (error) {
    console.error("[Selftest Error]:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Selftest failed." },
      { status: 500 }
    );
  }
}
