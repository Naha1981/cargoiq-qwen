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
    <section id="pricing" className="bg-cargoiq-navy py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-cargoiq-gold uppercase tracking-[0.2em] mb-3">Pricing</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cargoiq-fg mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-cargoiq-muted max-w-2xl mx-auto">
            Start free. Scale when you are ready.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-cargoiq-subtle max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                'relative bg-cargoiq-panel p-8 flex flex-col',
                plan.featured && 'bg-cargoiq-deep'
              )}
            >
              {plan.featured && (
                <div className="mb-6">
                  <span className="text-xs font-semibold text-cargoiq-gold uppercase tracking-[0.15em]">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-cargoiq-fg uppercase tracking-wider">
                  {plan.name}
                </h3>
                <p className="text-cargoiq-muted text-sm mt-1">{plan.description}</p>
              </div>
              <div className="mb-8">
                <span className="font-mono text-4xl font-bold text-cargoiq-fg">
                  {plan.price}
                </span>
                <span className="text-cargoiq-muted text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-cargoiq-gold mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-cargoiq-muted">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.cta === 'Contact Sales' ? '/login' : '/signup'}
                className={cn(
                  'block w-full text-center py-3 text-sm font-semibold uppercase tracking-wider transition-colors border',
                  plan.featured
                    ? 'bg-cargoiq-gold text-cargoiq-deep border-cargoiq-gold hover:bg-cargoiq-goldHover'
                    : 'bg-transparent text-cargoiq-fg border-cargoiq-subtle hover:border-cargoiq-muted'
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
