'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function ShadowAuditSection() {
  return (
    <section className="bg-primary-container py-20">
      <div className="max-w-5xl mx-auto px-margin-page text-center">
        <h2 className="font-headline-lg text-headline-lg text-on-primary-container mb-6">
          Run a free audit before you make any decision.
        </h2>
        <p className="font-body-lg text-body-lg text-on-primary-container/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          Our 90-second shadow audit connects to your existing documents and shows you exactly what CargoIQ will recover — with zero commitment.
        </p>
        <div className="flex items-center justify-center gap-3 mb-8 text-on-primary-container/70">
          <span className="material-symbols-outlined text-[14px]">schedule</span>
          <span className="font-label-caps text-label-caps">90 seconds to your first insight</span>
        </div>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-on-primary-container text-primary-container px-8 py-4 text-lg font-bold hover:opacity-90 transition-all flex items-center"
        >
          Start My Free Shadow Audit
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
