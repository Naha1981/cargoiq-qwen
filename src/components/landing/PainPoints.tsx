'use client';

import React from 'react';
import { AlertTriangle, TrendingUp, Clock, Shield } from 'lucide-react';

const painPoints = [
  {
    icon: AlertTriangle,
    amount: 'R14,169',
    label: 'Typical SARS Penalty',
    description: 'Modelled from typical SARS administrative penalties per customs violation; actual penalties vary by violation and value. Failures compound monthly without monitoring.',
  },
  {
    icon: TrendingUp,
    amount: '25%',
    label: 'Invoices With Errors',
    description: 'Industry benchmarks suggest a meaningful share of carrier invoices contain billing errors; CargoIQ audits every line and surfaces the overcharges.',
  },
  {
    icon: Clock,
    amount: 'R59,400',
    label: 'Unbilled Detention',
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
    <section className="py-20 px-margin-page bg-surface-container-lowest">
      <div className="mb-12">
        <h2 className="font-headline-md text-headline-md text-on-surface">The losses are not hidden. <span className="text-on-surface-variant">They are just unmonitored.</span></h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {painPoints.map((point, index) => (
          <div key={index} className="border-technical p-6 bg-surface-container hover-gold transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-risk-red">{point.icon === AlertTriangle ? 'gavel' : point.icon === TrendingUp ? 'receipt_long' : point.icon === Clock ? 'schedule' : 'priority_high'}</span>
              <span className="font-label-caps text-label-caps text-outline uppercase">{point.label.split(' ')[0]}</span>
            </div>
            <div className="mono text-right text-headline-md text-on-surface">{point.amount}</div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 text-right">{point.label.split(' ').slice(1).join(' ')}</p>
            <div className="mt-4 pt-4 border-t border-outline-variant text-[10px] text-outline mono text-right uppercase">illustrative/typical</div>
          </div>
        ))}
      </div>
    </section>
  );
}
