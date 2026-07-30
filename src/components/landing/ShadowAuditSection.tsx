'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function ShadowAuditSection() {
  return (
    <section className="py-[96px] px-6 md:px-10 lg:px-16 bg-[#1F0803]">
      <div className="mx-auto max-w-[920px] text-center">
        <span className="font-[var(--font-body-md)] text-[12px] font-semibold uppercase tracking-[0.08em] text-[#FF7A3C]">
          Proof before you pay
        </span>
        <h2 className="mt-4 font-[var(--font-display-lg)] text-white font-bold text-[32px] sm:text-[44px] tracking-[-0.03em] leading-tight">
          Run a free audit before you make any decision.
        </h2>
        <p className="mt-6 font-[var(--font-body-md)] text-[17px] leading-relaxed text-white/75 max-w-2xl mx-auto">
          Our shadow audit connects to your existing documents and shows you exactly what CargoIQ
          will recover — your verified Rand figure, line by line, before you commit to anything.
        </p>
        <div className="mt-9">
          <Link
            href="/signup"
            className="group inline-flex h-[52px] items-center gap-2 px-7 ember-button font-[var(--font-body-md)] text-[16px] font-semibold rounded-[6px] transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#F2451C]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A3C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F0803]"
          >
            Start My Free Shadow Audit
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <p className="mt-6 font-[var(--font-body-md)] text-[13px] text-white/55">
          These figures are illustrative benchmarks. The only verified figure we publish is the one{' '}
          <span className="text-white/80">your own shadow audit</span> produces.
        </p>
      </div>
    </section>
  );
}
