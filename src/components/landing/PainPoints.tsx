'use client';

import React from 'react';
import { AlertTriangle, TrendingUp, Clock, Shield } from 'lucide-react';

const painPoints = [
  {
    icon: AlertTriangle,
    amount: 'R14,169',
    label: 'Typical SARS Penalty (illustrative)',
    description: 'Modelled from typical SARS administrative penalties per customs violation; actual penalties vary by violation and value. Failures compound monthly without monitoring.',
  },
  {
    icon: TrendingUp,
    amount: '25%',
    label: 'Invoices With Errors (typical)',
    description: 'Industry benchmarks suggest a meaningful share of carrier invoices contain billing errors; CargoIQ audits every line and surfaces the overcharges.',
  },
  {
    icon: Clock,
    amount: 'R59,400',
    label: 'Unbilled Detention (illustrative)',
    description: 'Modelled monthly exposure from forgotten detention deadlines. Deadlines expire and revenue vanishes without alerts.',
  },
  {
    icon: Shield,
    amount: '99(2)',
    label: 'Personal Liability Risk',
    description: 'Under the Customs and Excise Act (incl. Section 99(2)), registered agents can be held liable for errors on entries they submit. CargoIQ flags the risk before submission.',
  },
];

export function PainPoints() {
  return (
    <section className="bg-cargoiq-deep border-y border-cargoiq-subtle">
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-cargoiq-gold uppercase tracking-[0.2em] mb-3">Losses Aren&apos;t Hidden</p>
          <h2 className="text-2xl md:text-3xl font-bold text-cargoiq-fg">
            The losses aren&apos;t hidden.{' '}
            <span className="text-cargoiq-red">They&apos;re just unmonitored.</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center py-8 px-4 border-t md:border-t-0 border-cargoiq-subtle"
            >
              <point.icon className="w-5 h-5 text-cargoiq-red mb-4" />
              <p className="font-mono text-3xl md:text-4xl font-bold text-cargoiq-fg mb-2 tracking-tight">
                {point.amount}
              </p>
              <p className="text-sm font-semibold text-cargoiq-muted uppercase tracking-wider mb-2">{point.label}</p>
              <p className="text-xs text-cargoiq-muted/70 leading-relaxed max-w-xs text-center">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
