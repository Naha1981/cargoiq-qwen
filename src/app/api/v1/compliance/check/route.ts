import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { shipmentDocumentSchema } from "@/modules/compliance-shield/schema";
import { runComplianceShield } from "@/modules/compliance-shield/service";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ error: "SERVICE_UNAVAILABLE", message: "Database not configured." }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    const parsed = shipmentDocumentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid shipment document format",
          details: parsed.error.flatten(),
        },
      }, { status: 400 });
    }

    const appUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerk_id, userId as string),
    });

    if (!appUser) {
      return NextResponse.json({ error: "TENANT_NOT_FOUND", message: "User not provisioned yet." }, { status: 403 });
    }

    const startTime = Date.now();
    const { results, overallStatus, totalExposureZar } = runComplianceShield(parsed.data);
    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        tenantId: appUser.tenantId,
        overallStatus,
        totalExposureZar,
        results,
        meta: {
          modulesRun: results.length,
          durationMs,
          holds: results.filter(r => r.status === "hold").length,
          warnings: results.filter(r => r.status === "warn").length,
          passes: results.filter(r => r.status === "pass").length,
        },
      },
    }, { status: 200 });

  } catch (error) {
    console.error("[Compliance Check Error]:", error);
    return NextResponse.json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Compliance check failed",
      },
    }, { status: 500 });
  }
}
