import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tenants, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  orgName: z.string().min(1, "Organisation name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  if (!db || !auth) {
    return NextResponse.json(
      { error: "SERVICE_UNAVAILABLE", message: "Database or auth not configured." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, orgName, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingTenant = await db.query.tenants.findFirst({
      where: (tenants, { eq }) => eq(tenants.name, orgName),
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: "ORGANISATION_EXISTS", message: "An organisation with this name already exists." },
        { status: 409 }
      );
    }

    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, normalizedEmail),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "USER_EXISTS", message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const tenantId = generateId();
    const tenant = await db.insert(tenants).values({
      id: tenantId,
      name: orgName,
      plan: "trial",
      status: "active",
    }).returning();

    const userId = generateId();
    const user = await db.insert(users).values({
      id: userId,
      tenantId,
      email: normalizedEmail,
      name,
      role: "owner",
    }).returning();

    const authResult = await auth.api.signUpEmail({
      body: { name, email: normalizedEmail, password },
      headers: new Headers(),
    });

    if (authResult && "user" in authResult) {
      return NextResponse.json({
        success: true,
        user: {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          tenantId: user[0].tenantId,
          role: user[0].role,
        },
        tenant: tenant[0],
        token: authResult.token || null,
      }, { status: 201 });
    }

    return NextResponse.json(
      { error: "AUTH_FAILED", message: "Failed to create authentication session." },
      { status: 500 }
    );
  } catch (error) {
    console.error("[Signup Error]:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Signup failed. Please try again." },
      { status: 500 }
    );
  }
}
