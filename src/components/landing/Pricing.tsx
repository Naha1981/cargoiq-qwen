'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Starter',
    price: 'R8,000',
    period: '/month',
    description: 'For solo clearing agents and small operations.',
    features: ['1 User', '50 Documents / month', 'Compliance Shield', 'HS Code Classifier', 'Email Support'],
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
    <section id="pricing" className="py-[104px] px-6 md:px-10 lg:px-16 bg-[#2A0B04]">
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center mb-16">
          <span className="font-[var(--font-body-md)] text-[12px] font-semibold uppercase tracking-[0.08em] text-[#FF7A3C]">
            Pricing
          </span>
          <h2 className="mt-3 font-[var(--font-display-lg)] text-white font-bold text-[32px] sm:text-[40px] tracking-[-0.03em]">
            Operational plans
          </h2>
          <p className="mt-4 font-[var(--font-body-md)] text-[16px] text-white/65 max-w-xl mx-auto">
            Transparent pricing built for freight forwarders and high-volume importers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] mx-auto items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col rounded-[8px] border p-8 transition-all',
                plan.featured
                  ? 'border-[#F2451C]/50 bg-gradient-to-b from-[#3a0d06] to-[#1F0803] md:-mt-4 md:mb-4'
                  : 'border-white/10 bg-white/[0.03]'
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full ember-button px-4 py-1 font-[var(--font-body-md)] text-[11px] font-bold uppercase tracking-wider text-white whitespace-nowrap">
                  Most Popular
                </span>
              )}
              <div>
                <h3 className="font-[var(--font-display-lg)] text-white font-semibold text-[20px] mb-2">
                  {plan.name}
                </h3>
                <p className="font-[var(--font-body-md)] text-[13px] text-white/55 mb-6 min-h-[40px]">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="font-[var(--font-mono)] text-[34px] font-bold text-white">{plan.price}</span>
                  <span className="font-[var(--font-body-md)] text-[14px] text-white/55">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-10">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3 font-[var(--font-body-md)] text-[14px] text-white/75">
                      <span className="material-symbols-outlined text-[#FF7A3C] text-[16px] mt-0.5">check</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={plan.cta === 'Contact Sales' ? 'mailto:sales@cargoiq.io' : '/signup'}
                className={cn(
                  'mt-auto inline-flex h-[48px] items-center justify-center font-[var(--font-body-md)] text-[14px] font-semibold rounded-[6px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A3C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A0B04]',
                  plan.featured
                    ? 'ember-button text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#F2451C]/30'
                    : 'border border-white/25 text-white hover:border-white/50 hover:bg-white/5'
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
