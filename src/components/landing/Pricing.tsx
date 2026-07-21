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
    <section className="bg-[#F1F4F8] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A2332] mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free. Scale when you are ready.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                'relative bg-white rounded-2xl p-8 border-2 flex flex-col',
                plan.featured
                  ? 'border-[#B8860B] shadow-xl scale-105'
                  : 'border-gray-100 shadow-sm'
              )}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#B8860B] text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#1A2332] mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold text-[#1A2332]">
                  {plan.price}
                </span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#B8860B] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.cta === 'Contact Sales' ? '/login' : '/signup'}
                className={cn(
                  'block w-full text-center py-3 rounded-full font-semibold transition-colors',
                  plan.featured
                    ? 'bg-[#B8860B] text-white hover:bg-[#D4922B]'
                    : 'bg-[#1A2332] text-white hover:bg-[#1A2332]/90'
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
