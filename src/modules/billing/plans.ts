// Single source of truth for self-serve billing plans. Previously this data
// only existed hardcoded inside src/components/landing/Pricing.tsx with no
// backend behind it -- moved here so the marketing page and the actual
// PayFast checkout can never drift out of sync with each other.
//
// Enterprise is intentionally excluded: it is "Contact Sales" on the landing
// page, not self-serve, and has no fixed price to charge automatically.

export interface BillingPlan {
  id: 'starter' | 'growth';
  name: string;
  priceZar: number;
  description: string;
  features: string[];
}

export const BILLING_PLANS: Record<'starter' | 'growth', BillingPlan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    priceZar: 8000,
    description: 'For solo clearing agents and small operations.',
    features: ['1 User', '50 Documents / month', 'Compliance Shield', 'HS Code Classifier', 'Email Support'],
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    priceZar: 18000,
    description: 'For growing freight teams and mid-size clearing agencies.',
    features: [
      '5 Users',
      '200 Documents / month',
      'All Starter features',
      'CarrierInvoice Auditor',
      'Shadow Audit',
      'Container Tracking',
      'Priority Support',
    ],
  },
};

export function getBillingPlan(planId: string): BillingPlan | null {
  if (planId === 'starter' || planId === 'growth') {
    return BILLING_PLANS[planId];
  }
  return null;
}
