import { db } from '@/lib/db';
import { subscriptions, paymentEvents, tenants } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import { getBillingPlan } from './plans';
import { buildCheckoutUrl, isPayfastConfigured } from '@/lib/integrations/payfast/client';

export type CreateCheckoutResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; reason: 'NOT_CONFIGURED' | 'INVALID_PLAN' };

export async function createCheckoutForTenant(
  tenantId: string,
  planId: string,
  buyerEmail: string,
  baseUrl: string
): Promise<CreateCheckoutResult> {
  if (!isPayfastConfigured()) {
    return { ok: false, reason: 'NOT_CONFIGURED' };
  }
  const plan = getBillingPlan(planId);
  if (!plan) {
    return { ok: false, reason: 'INVALID_PLAN' };
  }

  const subscriptionId = generateId();
  await db!.insert(subscriptions).values({
    id: subscriptionId,
    tenantId,
    planId: plan.id,
    status: 'pending',
    amountZar: plan.priceZar.toFixed(2),
  });

  const { url } = buildCheckoutUrl({
    tenantId,
    planId: plan.id,
    planName: plan.name,
    amountZar: plan.priceZar,
    buyerEmail,
    returnUrl: `${baseUrl}/settings/billing?status=success`,
    cancelUrl: `${baseUrl}/settings/billing?status=cancelled`,
    notifyUrl: `${baseUrl}/api/webhooks/payfast`,
  });

  return { ok: true, checkoutUrl: url };
}

export interface ItnPayload {
  pf_payment_id: string;
  payment_status: string;
  m_payment_id?: string;
  amount_gross?: string;
  token?: string;
}

/**
 * Process a validated ITN. Caller (the webhook route) is responsible for
 * signature + source verification BEFORE calling this -- this function
 * assumes the payload has already been confirmed authentic, and only
 * handles idempotent persistence + subscription state transition.
 */
export async function recordPaymentEvent(
  payload: ItnPayload,
  signatureValid: boolean,
  sourceValid: boolean,
  rawPayload: string
): Promise<{ alreadyProcessed: boolean }> {
  const existing = await db!.query.paymentEvents.findFirst({
    where: eq(paymentEvents.pfPaymentId, payload.pf_payment_id),
  });
  if (existing) {
    return { alreadyProcessed: true };
  }

  // Extract our subscription id from m_payment_id ("tenantId:planId:timestamp")
  // -- fall back gracefully if the format doesn't match.
  const [tenantId] = (payload.m_payment_id || '').split(':');
  const subscription = tenantId
    ? await db!.query.subscriptions.findFirst({
        where: and(eq(subscriptions.tenantId, tenantId), eq(subscriptions.status, 'pending')),
        orderBy: (s, { desc }) => [desc(s.createdAt)],
      })
    : undefined;

  await db!.insert(paymentEvents).values({
    id: generateId(),
    tenantId: subscription?.tenantId,
    subscriptionId: subscription?.id,
    pfPaymentId: payload.pf_payment_id,
    paymentStatus: payload.payment_status,
    amountGross: payload.amount_gross,
    signatureValid,
    sourceValid,
    rawPayload,
  });

  // Only transition subscription/tenant state for fully-validated,
  // successful payments -- an event with a bad signature or wrong source is
  // still logged for audit above, but never activates billing.
  if (signatureValid && sourceValid && subscription && payload.payment_status === 'COMPLETE') {
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await db!.update(subscriptions)
      .set({
        status: 'active',
        payfastPaymentId: payload.pf_payment_id,
        payfastToken: payload.token,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));

    await db!.update(tenants)
      .set({ plan: subscription.planId, status: 'active', updatedAt: new Date() })
      .where(eq(tenants.id, subscription.tenantId));
  }

  return { alreadyProcessed: false };
}
