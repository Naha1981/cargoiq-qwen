import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { getTenantForUser } from '@/lib/tenant/for-user';
import { createCheckoutForTenant } from '@/modules/billing/service';
import { consumeRateLimit, getRequestIp } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const checkoutSchema = z.object({
  planId: z.enum(['starter', 'growth']),
});

export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'SERVICE_UNAVAILABLE', message: 'Database not configured.' }, { status: 503 });
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    if (!(await consumeRateLimit(`billing-checkout:${userId || getRequestIp(req)}`, 5, 60_000))) {
      return NextResponse.json({ error: 'RATE_LIMIT_EXCEEDED' }, { status: 429 });
    }

    const resolved = await getTenantForUser(userId);
    if (!resolved) {
      return NextResponse.json({ error: 'TENANT_NOT_FOUND' }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const result = await createCheckoutForTenant(resolved.tenant.id, parsed.data.planId, resolved.appUser.email, baseUrl);

    if (!result.ok) {
      if (result.reason === 'NOT_CONFIGURED') {
        return NextResponse.json({ error: 'BILLING_NOT_CONFIGURED', message: 'Payment processing is not yet configured.' }, { status: 503 });
      }
      return NextResponse.json({ error: 'INVALID_PLAN' }, { status: 400 });
    }

    return NextResponse.json({ success: true, checkoutUrl: result.checkoutUrl });
  } catch (error) {
    console.error('[Billing Checkout Error]:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: 'Failed to create checkout session.' }, { status: 500 });
  }
}
