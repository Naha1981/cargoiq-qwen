import { db } from '@/lib/db';
import { drivers } from '@/lib/db/schema';
import { generateId, normalizePhoneNumber } from '@/lib/utils';
import { eq, and } from 'drizzle-orm';

export type DriverUpdates = Partial<{
  name: string;
  phoneNumber: string;
  defaultLocation: string | null;
  active: boolean;
}>;

/**
 * NOTE (pre-existing, not introduced by this move): driver.phoneNumber
 * uniqueness is checked GLOBALLY (not scoped by tenantId) in
 * createDriver() below. This mirrors the underlying single shared
 * WhatsApp/Evolution instance (EVOLUTION_INSTANCE_NAME, see ADR-CIQ-003)
 * -- one phone number can only ever route to one driver record across the
 * whole deployment, not one per tenant, because there is currently only one
 * WhatsApp number for the whole app. This is the same root cause already
 * tracked for the Phase 5 Messaging Platform migration, not a new/separate
 * finding, and is not changed here.
 */
export async function findDriverByPhone(normalizedPhone: string) {
  return db!.query.drivers.findFirst({ where: eq(drivers.phoneNumber, normalizedPhone) });
}

export async function listDriversForTenant(tenantId: string) {
  return db!.query.drivers.findMany({
    where: eq(drivers.tenantId, tenantId),
    orderBy: (d, { desc }) => [desc(d.createdAt)],
  });
}

export async function getDriverForTenant(driverId: string, tenantId: string) {
  return db!.query.drivers.findFirst({
    where: and(eq(drivers.id, driverId), eq(drivers.tenantId, tenantId)),
  });
}

export interface CreateDriverInput {
  tenantId: string;
  name: string;
  phoneNumber: string;
  defaultLocation?: string;
}

export type CreateDriverResult =
  | { ok: true; driver: typeof drivers.$inferSelect }
  | { ok: false; reason: 'PHONE_EXISTS' };

export async function createDriver(input: CreateDriverInput): Promise<CreateDriverResult> {
  const normalizedPhone = normalizePhoneNumber(input.phoneNumber);

  const existing = await findDriverByPhone(normalizedPhone);
  if (existing) {
    return { ok: false, reason: 'PHONE_EXISTS' };
  }

  const [driver] = await db!.insert(drivers).values({
    id: generateId(),
    tenantId: input.tenantId,
    name: input.name,
    phoneNumber: normalizedPhone,
    defaultLocation: input.defaultLocation,
    active: true,
  }).returning();

  return { ok: true, driver };
}

export async function updateDriverForTenant(driverId: string, tenantId: string, updates: DriverUpdates) {
  const patch: Record<string, unknown> = {};
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.phoneNumber !== undefined) patch.phoneNumber = normalizePhoneNumber(updates.phoneNumber);
  if (updates.defaultLocation !== undefined) patch.defaultLocation = updates.defaultLocation;
  if (updates.active !== undefined) patch.active = updates.active;

  const [updated] = await db!
    .update(drivers)
    .set(patch)
    .where(and(eq(drivers.id, driverId), eq(drivers.tenantId, tenantId)))
    .returning();

  return updated;
}

export async function deleteDriverForTenant(driverId: string, tenantId: string) {
  await db!.delete(drivers).where(and(eq(drivers.id, driverId), eq(drivers.tenantId, tenantId)));
}
