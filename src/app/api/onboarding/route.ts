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

const errorMap: Record<string, string> = {
  UNAUTHORIZED: 'Please sign in to continue.',
  VALIDATION_ERROR: 'Something went wrong — please try again.',
  ALREADY_SETUP: 'Your workspace is already set up.',
  ORG_TAKEN: 'That organisation name is already taken — please choose another.',
  INTERNAL_ERROR: 'Something went wrong — please try again.',
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: errorMap['UNAUTHORIZED'] }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: errorMap['VALIDATION_ERROR'] },
        { status: 400 }
      );
    }

    const { name, orgName } = parsed.data;

    if (!db) {
      return NextResponse.json({ message: 'Our system is temporarily unavailable — please try again shortly.' }, { status: 503 });
    }

    const existing = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerk_id, userId),
    });
    if (existing) {
      return NextResponse.json({ message: errorMap['ALREADY_SETUP'] }, { status: 400 });
    }

    const tenantRows = await db
      .select()
      .from(tenants)
      .where(sql`LOWER(${tenants.name}) = ${orgName.toLowerCase().trim()}`)
      .limit(1);
    if (tenantRows[0]) {
      return NextResponse.json(
        { message: errorMap['ORG_TAKEN'] },
        { status: 409 }
      );
    }

    let email = `${userId}@clerk.local`;
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      email = clerkUser.primaryEmailAddress?.emailAddress || email;
    } catch {
      // fallback email
    }

    const tenantId = generateId();
    await db.insert(tenants).values({
      id: tenantId,
      name: orgName,
      plan: 'trial',
      status: 'active',
    });

    await db.insert(users).values({
      id: generateId(),
      tenantId,
      clerk_id: userId,
      email: email.toLowerCase().trim(),
      name,
      role: 'owner',
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Onboarding Error]', error);
    const message = error instanceof Error ? error.message : 'Something went wrong.';
    return NextResponse.json({ message: errorMap['INTERNAL_ERROR'], details: message }, { status: 500 });
  }
}
