'use client';

import React from 'react';

const steps = [
  {
    icon: 'upload',
    title: 'Upload Documents',
    body: 'Sync your EDI, scan Bill of Ladings, or upload carrier invoices directly into CargoIQ.',
  },
  {
    icon: 'neurology',
    title: 'AI Compliance Analysis',
    body: 'Our engine runs 7 proprietary audits against SARS regulations and carrier datasets, line by line.',
  },
  {
    icon: 'trending_up',
    title: 'Recover Revenue',
    body: 'Automated recovery notes are sent to carriers and SARS disputes filed — with a verified savings certificate.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-[104px] px-6 md:px-10 lg:px-16 bg-[#1F0803]" id="workflow">
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center mb-16">
          <span className="font-[var(--font-body-md)] text-[12px] font-semibold uppercase tracking-[0.08em] text-[#FF7A3C]">
            How it works
          </span>
          <h2 className="mt-3 font-[var(--font-display-lg)] text-white font-bold text-[32px] sm:text-[40px] tracking-[-0.03em]">
            Three simple steps to recover what&apos;s yours
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* connecting line */}
          <div className="hidden md:block absolute top-[44px] left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-[#F2451C]/40 to-transparent" aria-hidden />
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              <div className="relative z-10 mx-auto mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-full border border-[#F2451C]/40 bg-[#2A0B04]">
                <span className="material-symbols-outlined text-[#FF7A3C] text-[32px]">{step.icon}</span>
                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full ember-button font-[var(--font-mono)] text-[11px] font-bold text-white">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="font-[var(--font-display-lg)] text-white font-semibold text-[20px] mb-3">
                {step.title}
              </h3>
              <p className="font-[var(--font-body-md)] text-[15px] leading-relaxed text-white/70 max-w-xs mx-auto">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
