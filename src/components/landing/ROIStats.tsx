'use client';

import React from 'react';
import { TrendingUp, PiggyBank, BarChart3 } from 'lucide-react';

const stats = [
  {
    icon: TrendingUp,
    value: '21.6x',
    label: 'Return on Investment',
    description: 'Average ROI within first 90 days',
  },
  {
    icon: PiggyBank,
    value: 'R14,169',
    label: 'Saved Per Month',
    description: 'Verified recovery per average client',
  },
  {
    icon: BarChart3,
    value: '25%',
    label: 'Carrier Invoices With Errors',
    description: 'Industry-verified billing error rate we audit line-by-line.',
  },
];

export function ROIStats() {
  return (
    <section className="bg-cargoiq-deep border-y border-cargoiq-subtle py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-cargoiq-gold uppercase tracking-[0.2em] mb-3">Proof</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cargoiq-fg mb-4">
            The numbers speak for themselves
          </h2>
          <p className="text-lg text-cargoiq-muted max-w-2xl mx-auto">
            Real results from real freight operations.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-cargoiq-subtle">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-cargoiq-panel p-8 md:p-10 text-center"
            >
              <stat.icon className="w-5 h-5 text-cargoiq-gold mx-auto mb-6" />
              <p className="font-mono text-5xl md:text-6xl font-bold text-cargoiq-fg mb-4 tracking-tight">
                {stat.value}
              </p>
              <h3 className="text-sm font-semibold text-cargoiq-muted uppercase tracking-wider mb-2">
                {stat.label}
              </h3>
              <p className="text-xs text-cargoiq-muted/70">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
