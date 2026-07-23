'use client';

import React from 'react';
import { AlertTriangle, TrendingUp, Clock, Shield } from 'lucide-react';

const painPoints = [
  {
    icon: AlertTriangle,
    amount: 'R14,169',
    label: 'Average SARS Penalty',
    description: 'Per customs violation. Compliance failures compound monthly without AI monitoring.',
  },
  {
    icon: TrendingUp,
    amount: '25%',
    label: 'Carrier Overcharges',
    description: 'Freight carriers routinely overcharge. Without invoice auditing, these leak straight to your P&L.',
  },
  {
    icon: Clock,
    amount: 'R59,400',
    label: 'Unbilled Detention',
    description: 'Monthly value of forgotten detention fees. Deadlines expire and revenue vanishes.',
  },
  {
    icon: Shield,
    amount: '99(2)',
    label: 'Personal Liability',
    description: 'Customs Act Section 99(2) makes clearing agents personally liable for undeclared or misclassified cargo.',
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
