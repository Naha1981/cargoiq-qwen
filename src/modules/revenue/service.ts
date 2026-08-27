import { db } from '@/lib/db';
import { rateCards, invoices } from '@/lib/db/schema';
import { generateId } from '@/lib/utils';
import { eq, and } from 'drizzle-orm';

// ---- Rate cards ----

export interface RateCardInput {
  carrier: string;
  chargeType: string;
  route: string;
  mode: 'per_kg' | 'per_container' | 'per_unit';
  ratePerKg?: number;
  ratePerContainer?: number;
  currency: string;
  validFrom?: string;
  validTo?: string;
}

export async function listRateCardsForTenant(tenantId: string) {
  return db!.query.rateCards.findMany({
    where: eq(rateCards.tenantId, tenantId),
    orderBy: (rc, { desc }) => [desc(rc.createdAt)],
  });
}

export async function createRateCard(tenantId: string, input: RateCardInput) {
  const now = new Date();
  const [card] = await db!.insert(rateCards).values({
    id: generateId(),
    tenantId,
    carrier: input.carrier,
    chargeType: input.chargeType,
    route: input.route,
    mode: input.mode,
    ratePerKg: input.ratePerKg ? input.ratePerKg.toString() : null,
    ratePerContainer: input.ratePerContainer ? input.ratePerContainer.toString() : null,
    currency: input.currency,
    validFrom: input.validFrom ? new Date(input.validFrom) : now,
    validTo: input.validTo ? new Date(input.validTo) : null,
    createdAt: now,
    updatedAt: now,
  }).returning();
  return card;
}

export async function getRateCardForTenant(id: string, tenantId: string) {
  return db!.query.rateCards.findFirst({
    where: and(eq(rateCards.id, id), eq(rateCards.tenantId, tenantId)),
  });
}

export async function updateRateCardForTenant(id: string, tenantId: string, updates: Record<string, unknown>) {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (updates.carrier !== undefined) updateData.carrier = updates.carrier;
  if (updates.chargeType !== undefined) updateData.chargeType = updates.chargeType;
  if (updates.route !== undefined) updateData.route = updates.route;
  if (updates.mode !== undefined) updateData.mode = updates.mode;
  if (updates.ratePerKg !== undefined) updateData.ratePerKg = updates.ratePerKg ? (updates.ratePerKg as number).toString() : null;
  if (updates.ratePerContainer !== undefined) updateData.ratePerContainer = updates.ratePerContainer ? (updates.ratePerContainer as number).toString() : null;
  if (updates.currency !== undefined) updateData.currency = updates.currency;
  if (updates.validFrom !== undefined) updateData.validFrom = updates.validFrom ? new Date(updates.validFrom as string) : null;
  if (updates.validTo !== undefined) updateData.validTo = updates.validTo ? new Date(updates.validTo as string) : null;

  // Tenant-scoped on the actual mutating query, not only on a prior
  // existence check (defense in depth -- the previous route implementation
  // scoped only the read-before-write check, not this UPDATE's WHERE
  // clause; not currently exploitable since callers already gate on the
  // existence check first, but fragile if that check were ever removed).
  const [updated] = await db!
    .update(rateCards)
    .set(updateData)
    .where(and(eq(rateCards.id, id), eq(rateCards.tenantId, tenantId)))
    .returning();
  return updated;
}

export async function deleteRateCardForTenant(id: string, tenantId: string) {
  await db!.delete(rateCards).where(and(eq(rateCards.id, id), eq(rateCards.tenantId, tenantId)));
}

// ---- Invoices ----

export interface InvoiceInput {
  tenantName: string;
  lineItems: unknown;
  totalAmountZar: number;
  dueDate?: string;
  findingId?: string;
}

export async function listInvoicesForTenant(tenantId: string) {
  return db!.query.invoices.findMany({
    where: eq(invoices.tenantId, tenantId),
    orderBy: (inv, { desc }) => [desc(inv.createdAt)],
  });
}

export async function createInvoice(tenantId: string, input: InvoiceInput) {
  const now = new Date();
  const reference = `INV-${Date.now()}`;
  const [invoice] = await db!.insert(invoices).values({
    id: generateId(),
    tenantId,
    reference,
    tenantName: input.tenantName,
    lineItems: JSON.stringify(input.lineItems),
    totalAmountZar: input.totalAmountZar.toString(),
    dueDate: input.dueDate ? new Date(input.dueDate) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    status: 'draft',
    createdAt: now,
  }).returning();
  return invoice;
}
