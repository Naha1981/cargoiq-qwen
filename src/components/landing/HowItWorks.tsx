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
    body: 'Every document runs through seven automated compliance gates — HS codes, valuations, origin rules, and more.',
  },
  {
    icon: TrendingUp,
    title: 'Recover Revenue',
    body: 'We flag overcharges, missed recoveries, and detention claims. You keep the refunds.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-cargoiq-panel py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-cargoiq-gold uppercase tracking-[0.2em] mb-3">How CargoIQ Works</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cargoiq-fg mb-4">
            How CargoIQ Works
          </h2>
          <p className="text-lg text-cargoiq-muted max-w-2xl mx-auto">
            Three steps from document chaos to controlled compliance and recovered revenue.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-cargoiq-subtle">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-cargoiq-panel p-8 md:p-10 group hover:bg-cargoiq-deep transition-colors"
            >
              <span className="font-mono text-xs text-cargoiq-gold/60 mb-6 block">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="mb-6">
                <step.icon className="w-6 h-6 text-cargoiq-gold" />
              </div>
              <h3 className="text-xl font-semibold text-cargoiq-fg mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-cargoiq-muted leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
