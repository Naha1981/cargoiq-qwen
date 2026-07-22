import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, sessions } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth-password";
import { generateId } from "@/lib/utils";
import crypto from "crypto";
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  if (!db) {
    return NextResponse.json(
      { error: "SERVICE_UNAVAILABLE", message: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim() : "";
    const password = typeof body?.password === 'string' ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, normalizedEmail),
    });

    if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionId = generateId();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      tenantId: user.tenantId,
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
    console.error("[Signin Error]", error);
    const message = error instanceof Error ? error.message : "Sign-in failed. Please try again.";
    return NextResponse.json({ error: "INTERNAL_ERROR", message }, { status: 500 });
  }
}
