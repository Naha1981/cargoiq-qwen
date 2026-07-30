'use client';

import React from 'react';

const painPoints = [
  {
    icon: 'gavel',
    amount: 'R14,169',
    label: 'Typical SARS Penalty',
    description:
      'Modelled from typical SARS administrative penalties per customs violation; actual penalties vary by violation and value. Failures compound monthly without monitoring.',
  },
  {
    icon: 'receipt_long',
    amount: '25%',
    label: 'Invoices With Errors',
    description:
      'Industry benchmarks suggest a meaningful share of carrier invoices contain billing errors; CargoIQ audits every line and surfaces the overcharges.',
  },
  {
    icon: 'schedule',
    amount: 'R59,400',
    label: 'Unbilled Detention',
    description:
      'Modelled monthly exposure from forgotten detention deadlines. Deadlines expire and revenue vanishes without alerts.',
  },
  {
    icon: 'priority_high',
    amount: '99(2)',
    label: 'Personal Liability Risk',
    description:
      'Under the Customs and Excise Act (incl. Section 99(2)), registered agents can be held liable for errors on entries they submit. CargoIQ flags the risk before submission.',
  },
];

export function PainPoints() {
  return (
    <section className="relative py-[96px] px-6 md:px-10 lg:px-16 bg-[#2A0B04]">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-12">
          <span className="font-[var(--font-body-md)] text-[12px] font-semibold uppercase tracking-[0.08em] text-[#FF7A3C]">
            The silent drain
          </span>
          <h2 className="mt-3 font-[var(--font-display-lg)] text-white font-bold text-[32px] sm:text-[40px] leading-tight tracking-[-0.03em]">
            The losses are not hidden.{' '}
            <span className="text-white/55">They are just unmonitored.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className="rounded-[6px] border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-[#F2451C]/40 hover:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between mb-5">
                <span className="material-symbols-outlined text-[#FF7A3C] text-[28px]">{point.icon}</span>
                <span className="font-[var(--font-body-md)] text-[10px] uppercase tracking-wider text-white/40">
                  illustrative
                </span>
              </div>
              <div className="font-[var(--font-mono)] text-[26px] font-semibold text-white text-right">
                {point.amount}
              </div>
              <p className="mt-2 font-[var(--font-body-md)] text-[14px] text-white/80 text-right">
                {point.label}
              </p>
              <p className="mt-4 pt-4 border-t border-white/10 font-[var(--font-body-md)] text-[12px] leading-relaxed text-white/55">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
