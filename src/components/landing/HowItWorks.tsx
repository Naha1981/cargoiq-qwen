'use client';

import React from 'react';
import { Upload, Search, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Documents',
    body: 'Drag-and-drop your invoices, packing lists, and customs declarations. Our AI parses them instantly.',
  },
  {
    icon: Search,
    title: '7 Compliance Checks',
    body: 'Every document runs through seven automated compliance gates — HS codes, SACU/Non-SACU VAT, DA65, TMS pre-declaration, and more.',
  },
  {
    icon: TrendingUp,
    title: 'Recover Revenue',
    body: 'We flag overcharges, missed recoveries, and detention claims. You keep the refunds.',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-[#F1F4F8] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A2332] mb-4">
            How CargoIQ Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Three steps from document chaos to controlled compliance and recovered revenue.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-[#B8860B]/10 rounded-2xl flex items-center justify-center">
                <step.icon className="w-8 h-8 text-[#B8860B]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#1A2332] mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
