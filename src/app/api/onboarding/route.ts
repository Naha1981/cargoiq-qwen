import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { tenants, users } from '@/lib/db/schema';
import { generateId } from '@/lib/utils';
import { z } from 'zod';
import { sql } from 'drizzle-orm';

const schema = z.object({
  name: z.string().min(1, 'Please enter your name'),
  orgName: z.string().min(1, 'Please enter your organisation name'),
});

function isPostgresUniqueViolation(err: unknown): boolean {
  if (err instanceof Error && 'code' in err) {
    return (err as Error & { code?: string }).code === '23505';
  }
  return false;
}

function onboardCode(): string {
  return 'ONBOARD_' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Please sign in to continue.' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Please check your inputs and try again.' },
        { status: 400 }
      );
    }

    const { name, orgName } = parsed.data;

    if (!db) {
      console.error('[Onboarding] db handle is null — DATABASE_URL missing or invalid at module init');
      return NextResponse.json(
        { message: "CargoIQ's database isn't connected on the live server yet (the DATABASE_URL setting is missing). This is a one-time setup step — please tell the founder to add it." },
        { status: 503 }
      );
    }

    const existing = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerk_id, userId),
    });
    if (existing) {
      return NextResponse.json({ message: 'Your workspace is already set up.' }, { status: 400 });
    }

    const tenantRows = await db
      .select()
      .from(tenants)
      .where(sql`LOWER(${tenants.name}) = ${orgName.toLowerCase().trim()}`)
      .limit(1);
    if (tenantRows[0]) {
      return NextResponse.json(
        { message: 'That organisation name is already taken — please choose another.' },
        { status: 409 }
      );
    }

    let email = '';
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      email = clerkUser.emailAddresses?.[0]?.emailAddress?.trim() || '';
    } catch {
      // ignore and fallback below
    }
    if (!email) {
      email = `${userId}@clerk.placeholder`;
    }

    const tenantId = generateId();

    try {
      await db.insert(tenants).values({
        id: tenantId,
        name: orgName,
        plan: 'trial',
        status: 'active',
      });
    } catch (err) {
      console.error('[Onboarding] tenant insert failed', err);
      if (isPostgresUniqueViolation(err)) {
        return NextResponse.json(
          { message: 'That organisation name is already taken — please choose another.' },
          { status: 409 }
        );
      }
      const code = onboardCode();
      console.error(`[Onboarding Error ${code}] tenant insert`, err);
      return NextResponse.json(
        { message: `We couldn't create your workspace just now (error ${code}). Please try once more; if it persists, share this code with support.` },
        { status: 500 }
      );
    }

    try {
      await db.insert(users).values({
        id: generateId(),
        tenantId,
        clerk_id: userId,
        email: email.toLowerCase(),
        name,
        role: 'owner',
      });
    } catch (err) {
      console.error('[Onboarding] user insert failed', err);
      if (isPostgresUniqueViolation(err)) {
        return NextResponse.json({ message: 'An account is already set up — try signing in.' }, { status: 409 });
      }
      const code = onboardCode();
      console.error(`[Onboarding Error ${code}] user insert`, err);
      return NextResponse.json(
        { message: `We couldn't create your workspace just now (error ${code}). Please try once more; if it persists, share this code with support.` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Onboarding Fatal]', err);
    const code = onboardCode();
    console.error(`[Onboarding Error ${code}] fatal catch`, err);
    return NextResponse.json(
      { message: `We couldn't create your workspace just now (error ${code}). Please try once more; if it persists, share this code with support.` },
      { status: 500 }
    );
  }
}
