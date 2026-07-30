'use client';

import React from 'react';

/* Proof / honesty band: three mono stats, each illustrative/typical, plus the
   honesty line. No fabricated per-client figures. */
const stats = [
  {
    icon: 'trending_up',
    value: '21.6\u00d7',
    label: 'Illustrative ROI',
    micro: 'illustrative / modelled',
    description:
      'Detected leakage vs. subscription, modelled for a mid-size operation. Your real multiple comes from your audit.',
  },
  {
    icon: 'payments',
    value: 'R14,169',
    label: 'Typical Monthly Leakage',
    micro: 'illustrative / typical',
    description:
      'Modelled monthly leakage per mid-size operation. NOT a client result — your audit makes it real.',
  },
  {
    icon: 'verified',
    value: '7',
    label: 'Automated Checks Per Document',
    micro: 'spec',
    description:
      'HS code \u00b7 valuation \u00b7 origin \u00b7 Incoterms \u00b7 detention \u00b7 RLA status \u00b7 personal liability — every document, every time.',
  },
];

export function ROIStats() {
  return (
    <section className="py-[96px] px-6 md:px-10 lg:px-16 bg-[#1F0803]">
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center mb-14">
          <span className="font-[var(--font-body-md)] text-[12px] font-semibold uppercase tracking-[0.08em] text-[#FF7A3C]">
            Proof
          </span>
          <h2 className="mt-3 font-[var(--font-display-lg)] text-white font-bold text-[32px] sm:text-[40px] tracking-[-0.03em] max-w-3xl mx-auto">
            Grounded in real law and real economics — your verified number is next.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[8px] border border-white/10 bg-white/[0.03] p-8 text-center">
              <span className="material-symbols-outlined text-[#FF7A3C] text-[28px] mx-auto mb-5 block">{stat.icon}</span>
              <p className="font-[var(--font-mono)] text-[36px] font-bold text-white">{stat.value}</p>
              <p className="mt-2 font-[var(--font-body-md)] text-[11px] uppercase tracking-wider text-[#FF7A3C]">
                {stat.micro}
              </p>
              <h3 className="mt-1 font-[var(--font-body-md)] text-[14px] font-semibold text-white/85">{stat.label}</h3>
              <p className="mt-3 font-[var(--font-body-md)] text-[12px] leading-relaxed text-white/55">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center font-[var(--font-body-md)] text-[13px] leading-relaxed text-white/60 max-w-3xl mx-auto">
          These figures are illustrative benchmarks. The only verified figure we publish is the one{' '}
          <span className="text-white/85">your own shadow audit</span> produces.
        </p>
      </div>
    </section>
  );
}
