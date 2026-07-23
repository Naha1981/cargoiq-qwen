// DEPRECATED — replaced by Clerk. Do not use.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tenants, users, sessions } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { hashPassword } from "@/lib/auth-password";
import { z } from "zod";
import crypto from "crypto";
import { sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  orgName: z.string().min(1, "Organisation name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  if (!db) {
    return NextResponse.json(
      { error: "SERVICE_UNAVAILABLE", message: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: parsed.error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { name, email, orgName, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const tenantRows = await db
      .select()
      .from(tenants)
      .where(sql`LOWER(${tenants.name}) = ${orgName.toLowerCase().trim()}`)
      .limit(1);
    const existingTenant = tenantRows[0];

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
        { error: "USER_EXISTS", message: "An account with this email already exists. Try signing in." },
        { status: 409 }
      );
    }

    const tenantId = generateId();
    const [tenant] = await db
      .insert(tenants)
      .values({
        id: tenantId,
        name: orgName,
        plan: "trial",
        status: "active",
      })
      .returning();

    const userId = generateId();
    const passwordHash = hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        tenantId,
        email: normalizedEmail,
        name,
        password_hash: passwordHash,
        role: "owner",
      })
      .returning();

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionId = generateId();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(sessions).values({
      id: sessionId,
      userId,
      tenantId,
      token: sessionToken,
      expiresAt,
    });

    const response = NextResponse.json({ ok: true, redirect: "/dashboard" });
    response.cookies.set("ciq_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("[Signup Error]", error);
    const message = error instanceof Error ? error.message : "Signup failed. Please try again.";
    return NextResponse.json({ error: "INTERNAL_ERROR", message }, { status: 500 });
  }
}
