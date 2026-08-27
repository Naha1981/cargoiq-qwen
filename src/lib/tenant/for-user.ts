import { db } from '@/lib/db';
import { tenants, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface TenantForUser {
  appUser: typeof users.$inferSelect;
  tenant: typeof tenants.$inferSelect;
}

/**
 * Resolve the tenant for an authenticated Clerk user. Tenant is ALWAYS
 * derived server-side from this lookup -- never accept a tenant/tenantId
 * from client input.
 *
 * Consolidates a pattern that was independently reimplemented (with slightly
 * different return shapes) in: src/app/api/parse/service.ts, src/app/api/v1/
 * drivers/route.ts, and elsewhere. Extracted during Phase 4 (domain module
 * structure). Returns null if the user or their tenant can't be found --
 * callers decide the appropriate error response for their route.
 */
export async function getTenantForUser(clerkUserId: string): Promise<TenantForUser | null> {
  if (!db) return null;

  const appUser = await db.query.users.findFirst({
    where: eq(users.clerk_id, clerkUserId),
  });
  if (!appUser) return null;

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, appUser.tenantId),
  });
  if (!tenant) return null;

  return { appUser, tenant };
}
