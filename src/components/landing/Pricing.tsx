'use client';

import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Starter',
    price: 'R8,000',
    period: '/month',
    description: 'For solo clearing agents and small operations.',
    features: [
      '1 User',
      '50 Documents / month',
      'Compliance Shield',
      'HS Code Classifier',
      'Email Support',
    ],
    cta: 'Start Free Trial',
    featured: false,
  },
  {
    name: 'Growth',
    price: 'R18,000',
    period: '/month',
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
    cta: 'Start Free Trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'R45,000',
    period: '/month',
    description: 'For large operators and multi-site clearing agencies.',
    features: [
      'Unlimited Users',
      'Unlimited Documents',
      'All Growth features',
      'RLA Sentinel',
      'Section 99(2) Tracker',
      'Custom Integrations',
      'Dedicated Success Manager',
    ],
    cta: 'Contact Sales',
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-margin-page bg-surface">
      <div className="text-center mb-16">
        <h2 className="font-headline-lg text-headline-lg uppercase industrial-tracking">Operational Plans</h2>
        <p className="text-on-surface-variant max-w-xl mx-auto mt-4">Transparent pricing built for freight forwarders and high-volume importers.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={cn(
              'border-technical bg-surface-container p-8 flex flex-col justify-between hover-gold transition-all',
              plan.featured && 'border-2 border-primary'
            )}
          >
            {plan.featured && (
              <div className="absolute top-0 right-0 bg-primary text-on-primary px-3 py-1 font-label-caps text-label-caps font-bold">MOST POPULAR</div>
            )}
            <div>
              <h3 className="font-headline-md text-headline-md mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="mono text-headline-lg font-bold">{plan.price}</span>
                <span className="text-on-surface-variant text-body-md">{plan.period}</span>
              </div>
              <ul className="space-y-4 mb-12">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3 text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-sm mt-1">check</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href={plan.cta === 'Contact Sales' ? '/login' : '/signup'}
              className={cn(
                'block w-full py-4 border font-bold hover:bg-surface-container-high transition-colors uppercase text-sm tracking-widest text-center',
                plan.featured
                  ? 'bg-primary text-on-primary hover:opacity-90 border-primary'
                  : 'border-outline-variant text-on-surface-variant'
              )}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
