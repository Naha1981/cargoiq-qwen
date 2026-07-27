import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { tenants, users } from '@/lib/db/schema';
import { generateId } from '@/lib/utils';
import { z } from 'zod';
import { sql, eq } from 'drizzle-orm';

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

async function tenantHasUsers(tenantId: string): Promise<boolean> {
  const rows = await db.select().from(users).where(eq(users.tenantId, tenantId)).limit(1);
  return rows.length > 0;
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

    let email = '';
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      email = clerkUser.emailAddresses?.[0]?.emailAddress?.trim() || '';
    } catch {
      // ignore and fallback below
    }
    if (!email) {
      email = userId + '@clerk.placeholder';
    }

    // Unified lookup: by clerk_id (normal) OR by email (legacy rows)
    const existingByClerkId = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.clerk_id, userId),
    });

    const existing = existingByClerkId ?? await db.query.users.findFirst({
      where: (u, { sql }) => sql`LOWER(${u.email}) = LOWER(${email})`,
    });

    if (existing) {
      // CLAIM path — finish the existing row instead of inserting a duplicate
      let tenantId = existing.tenantId;

      if (!tenantId) {
        // No tenant yet — find or create one
        const tenantRows = await db
          .select()
          .from(tenants)
          .where(sql`LOWER(${tenants.name}) = ${orgName.toLowerCase().trim()}`)
          .limit(1);

        if (tenantRows[0]) {
          if (await tenantHasUsers(tenantRows[0].id)) {
            return NextResponse.json(
              { message: 'That organisation name is already taken — please choose another.' },
              { status: 409 }
            );
          }
          tenantId = tenantRows[0].id;
        } else {
          tenantId = generateId();
          try {
            await db.insert(tenants).values({
              id: tenantId,
              name: orgName,
              plan: 'trial',
              status: 'active',
            });
          } catch (err) {
            if (isPostgresUniqueViolation(err)) {
              const takenTenant = await db.query.tenants.findFirst({
                where: (t, { sql }) => sql`LOWER(${t.name}) = ${orgName.toLowerCase().trim()}`,
              });
              if (takenTenant && await tenantHasUsers(takenTenant.id)) {
                return NextResponse.json(
                  { message: 'That organisation name is already taken — please choose another.' },
                  { status: 409 }
                );
              }
              tenantId = takenTenant!.id;
            } else {
              const code = onboardCode();
              console.error(`[Onboarding Error ${code}] tenant insert`, err);
              return NextResponse.json(
                { message: `We couldn't create your workspace just now (error ${code}). Please try once more; if it persists, share this code with support.` },
                { status: 500 }
              );
            }
          }
        }
      }

      try {
        await db.update(users).set({
          clerk_id: userId,
          tenantId: tenantId,
          name: name,
          email: email.toLowerCase().trim(),
        }).where(eq(users.id, existing.id));
      } catch (err) {
        if (isPostgresUniqueViolation(err)) {
          const otherUser = await db.query.users.findFirst({
            where: (u, { eq }) => eq(u.clerk_id, userId),
          });
          if (otherUser && otherUser.tenantId) {
            const tenant = await db.query.tenants.findFirst({
              where: (t, { eq }) => eq(t.id, otherUser.tenantId),
            });
            if (tenant) {
              return NextResponse.json({ ok: true });
            }
          }
          return NextResponse.json(
            { message: 'An account is already set up — try signing in.' },
            { status: 409 }
          );
        }
        const code = onboardCode();
        console.error(`[Onboarding Error ${code}] user update`, err);
        return NextResponse.json(
          { message: `We couldn't finish your setup just now (error ${code}). Please try once more; if it persists, share this code with support.` },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true });
    }

    // CREATE path — no existing user row found
    const tenantRows = await db
      .select()
      .from(tenants)
      .where(sql`LOWER(${tenants.name}) = ${orgName.toLowerCase().trim()}`)
      .limit(1);
    if (tenantRows[0] && await tenantHasUsers(tenantRows[0].id)) {
      return NextResponse.json(
        { message: 'That organisation name is already taken — please choose another.' },
        { status: 409 }
      );
    }

    const tenantId = tenantRows[0] ? tenantRows[0].id : generateId();

    if (!tenantRows[0]) {
      try {
        await db.insert(tenants).values({
          id: tenantId,
          name: orgName,
          plan: 'trial',
          status: 'active',
        });
      } catch (err) {
        if (isPostgresUniqueViolation(err)) {
          const takenTenant = await db.query.tenants.findFirst({
            where: (t, { sql }) => sql`LOWER(${t.name}) = ${orgName.toLowerCase().trim()}`,
          });
          if (takenTenant) {
            return NextResponse.json(
              { message: 'That organisation name is already taken — please choose another.' },
              { status: 409 }
            );
          }
          const code = onboardCode();
          console.error(`[Onboarding Error ${code}] tenant race`, err);
          return NextResponse.json(
            { message: `We couldn't create your workspace just now (error ${code}). Please try once more; if it persists, share this code with support.` },
            { status: 500 }
          );
        }
        const code = onboardCode();
        console.error(`[Onboarding Error ${code}] tenant insert`, err);
        return NextResponse.json(
          { message: `We couldn't create your workspace just now (error ${code}). Please try once more; if it persists, share this code with support.` },
          { status: 500 }
        );
      }
    }

    try {
      await db.insert(users).values({
        id: generateId(),
        tenantId: tenantId,
        clerk_id: userId,
        email: email.toLowerCase().trim(),
        name,
        role: 'owner',
      });
    } catch (err) {
      if (isPostgresUniqueViolation(err)) {
        // Email collision — claim the existing row instead of failing
        const existingByEmail = await db.query.users.findFirst({
          where: (u, { sql }) => sql`LOWER(${u.email}) = LOWER(${email})`,
        });
        if (existingByEmail) {
          await db.update(users).set({
            clerk_id: userId,
            tenantId: tenantId,
            name: name,
          }).where(eq(users.id, existingByEmail.id));
          return NextResponse.json({ ok: true });
        }
        return NextResponse.json(
          { message: 'An account is already set up — try signing in.' },
          { status: 409 }
        );
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