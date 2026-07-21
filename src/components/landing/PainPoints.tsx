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
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A2332]">
            The losses aren&apos;t hidden.{' '}
            <span className="text-[#DC2626]">They&apos;re just unmonitored.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#DC2626]/10 rounded-xl">
                  <point.icon className="w-8 h-8 text-[#DC2626]" />
                </div>
                <div>
                  <p className="font-mono text-3xl md:text-4xl font-bold text-[#DC2626] mb-2">
                    {point.amount}
                  </p>
                  <h3 className="text-xl font-semibold text-[#1A2332] mb-2">
                    {point.label}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
