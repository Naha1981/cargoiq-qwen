import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getTenantForUser } from '@/lib/tenant/for-user';
import { isPayfastConfigured } from '@/lib/integrations/payfast/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/v1/billing/subscription
 * Current plan + active subscription state for the authenticated tenant.
 * Read-only, tenant-scoped.
 */
export async function GET() {
  if (!db) {
    return NextResponse.json({ error: 'SERVICE_UNAVAILABLE' }, { status: 503 });
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const resolved = await getTenantForUser(userId);
    if (!resolved) {
      return NextResponse.json({ error: 'TENANT_NOT_FOUND' }, { status: 403 });
    }

    const activeSubscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, resolved.tenant.id),
      orderBy: (s, { desc }) => [desc(s.createdAt)],
    });

    return NextResponse.json({
      currentPlan: resolved.tenant.plan,
      billingConfigured: isPayfastConfigured(),
      subscription: activeSubscription
        ? {
            planId: activeSubscription.planId,
            status: activeSubscription.status,
            amountZar: activeSubscription.amountZar,
            currentPeriodEnd: activeSubscription.currentPeriodEnd,
          }
        : null,
    });
  } catch (error) {
    console.error('[Billing Subscription GET Error]:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
