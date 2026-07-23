// DEPRECATED — replaced by Clerk. Do not use.
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";

let _auth: ReturnType<typeof betterAuth> | null = null;

if (db && process.env.BETTER_AUTH_SECRET) {
  _auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    database: drizzleAdapter(db, { provider: "pg" }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      autoSignIn: true,
      minPasswordLength: 8,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
  }) as ReturnType<typeof betterAuth>;
}

export const auth = _auth;
