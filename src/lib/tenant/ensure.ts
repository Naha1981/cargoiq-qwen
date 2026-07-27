import { db } from '@/lib/db';
import { clerkClient } from '@clerk/nextjs/server';
import { eq, sql } from 'drizzle-orm';
import { tenants, users } from '@/lib/db/schema';
import { generateId } from '@/lib/utils';

function randomAlnum(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function getEmail(clerkUserId: string): Promise<string> {
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress?.trim();
    if (email) return email;
  } catch {
    // ignore
  }
  return `${clerkUserId}@clerk.placeholder`;
}

async function getClerkName(clerkUserId: string): Promise<string | null> {
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);
    const first = clerkUser.firstName || '';
    const last = clerkUser.lastName || '';
    const joined = `${first} ${last}`.trim();
    if (joined) return joined;
  } catch {
    // ignore
  }
  return null;
}

function emailLocalPart(email: string): string {
  return email.split('@')[0] || email;
}

async function tenantHasUsers(tenantId: string): Promise<boolean> {
  if (!db) return false;
  const rows = await db.select().from(users).where(eq(users.tenantId, tenantId)).limit(1);
  return rows.length > 0;
}

async function resolveTenant(name: string): Promise<typeof tenants.$inferSelect> {
  if (!db) throw new Error('db is null');

  const attempts = [name];
  for (let i = 0; i < 5; i++) {
    const suffix = randomAlnum(4);
    attempts.push(`${name}-${suffix}`);
  }

  for (const attempt of attempts) {
    const id = generateId();
    try {
      await db.insert(tenants).values({
        id,
        name: attempt,
        plan: 'trial',
        status: 'active',
      });
      return { id, name: attempt, plan: 'trial', status: 'active', whatsappNumber: null, createdAt: new Date(), updatedAt: new Date() };
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && (err as Error & { code?: string }).code === '23505') {
        const existing = await db.query.tenants.findFirst({
          where: (t, { sql }) => sql`LOWER(${t.name}) = LOWER(${attempt})`,
        });
        if (existing) {
          const hasUsers = await tenantHasUsers(existing.id);
          if (!hasUsers) return existing;
          continue;
        }
        continue;
      }
      throw err;
    }
  }

  throw new Error('Could not resolve tenant name after retries');
}

export async function ensureTenant(clerkUserId: string): Promise<{ user: typeof users.$inferSelect; tenant: typeof tenants.$inferSelect } | null> {
  if (!db) return null;

  const email = await getEmail(clerkUserId);
  const clerkName = await getClerkName(clerkUserId);
  const defaultName = clerkName || emailLocalPart(email);

  const existingByClerkId = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.clerk_id, clerkUserId),
  });

  const existingByEmail = await db.query.users.findFirst({
    where: (u, { sql }) => sql`LOWER(${u.email}) = LOWER(${email})`,
  });

  const existing = existingByClerkId ?? existingByEmail;

  if (!existing) {
    let tenant: typeof tenants.$inferSelect;
    try {
      tenant = await resolveTenant(defaultName);
    } catch {
      return null;
    }

    const userId = generateId();
    try {
      await db.insert(users).values({
        id: userId,
        tenantId: tenant.id,
        clerk_id: clerkUserId,
        email: email.toLowerCase().trim(),
        name: clerkName || emailLocalPart(email),
        role: 'owner',
      });
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && (err as Error & { code?: string }).code === '23505') {
        const recheck = await db.query.users.findFirst({
          where: (u, { sql }) => sql`LOWER(${u.email}) = LOWER(${email})`,
        });
        if (recheck) {
          let userTenant: typeof tenants.$inferSelect | null = null;
          if (recheck.tenantId) {
            userTenant = (await db.query.tenants.findFirst({
              where: (t, { eq }) => eq(t.id, recheck.tenantId),
            })) ?? null;
          }
          if (!userTenant && recheck.tenantId) {
            try {
              userTenant = await resolveTenant(defaultName);
              await db.update(users).set({ tenantId: userTenant.id }).where(eq(users.id, recheck.id));
            } catch {
              return null;
            }
          }
          return { user: recheck, tenant: userTenant! };
        }
        return null;
      }
      return null;
    }

    const newUser = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });
    if (!newUser) return null;

    return { user: newUser, tenant };
  }

  if (existing.clerk_id === null || existing.clerk_id !== clerkUserId) {
    try {
      await db.update(users).set({ clerk_id: clerkUserId }).where(eq(users.id, existing.id));
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && (err as Error & { code?: string }).code === '23505') {
        const owner = await db.query.users.findFirst({
          where: (u, { eq }) => eq(u.clerk_id, clerkUserId),
        });
        if (owner) {
          let userTenant: typeof tenants.$inferSelect | null = null;
          if (owner.tenantId) {
            userTenant = (await db.query.tenants.findFirst({
              where: (t, { eq }) => eq(t.id, owner.tenantId),
            })) ?? null;
          }
          if (!userTenant && owner.tenantId) {
            try {
              userTenant = await resolveTenant(defaultName);
              await db.update(users).set({ tenantId: userTenant.id }).where(eq(users.id, owner.id));
            } catch {
              return null;
            }
          }
          return { user: owner, tenant: userTenant! };
        }
        return null;
      }
      return null;
    }
  }

  let user = existing;
  if (user.clerk_id !== clerkUserId) {
    const refreshed = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, existing.id),
    });
    if (refreshed) user = refreshed;
  }

  if (!user.tenantId) {
    let tenant: typeof tenants.$inferSelect;
    try {
      tenant = await resolveTenant(defaultName);
    } catch {
      return null;
    }
    try {
      await db.update(users).set({ tenantId: tenant.id }).where(eq(users.id, user.id));
    } catch {
      return null;
    }
    const refreshedUser = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, user.id),
    });
    if (!refreshedUser) return null;
    return { user: refreshedUser, tenant };
  }

  const tenantRow = await db.query.tenants.findFirst({
    where: (t, { eq }) => eq(t.id, user.tenantId),
  });

  if (!tenantRow) {
    let tenant: typeof tenants.$inferSelect;
    try {
      tenant = await resolveTenant(defaultName);
    } catch {
      return null;
    }
    try {
      await db.update(users).set({ tenantId: tenant.id }).where(eq(users.id, user.id));
    } catch {
      return null;
    }
    const refreshedUser = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, user.id),
    });
    if (!refreshedUser) return null;
    return { user: refreshedUser, tenant };
  }

  return { user, tenant: tenantRow };
}