'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';


export function ShadowAuditSection() {
  return (
    <section className="bg-cargoiq-gold py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cargoiq-deep mb-6">
          Run a free audit before you make any decision.
        </h2>
        <p className="text-lg text-cargoiq-deep/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          Our 90-second shadow audit connects to your existing documents and shows you exactly what CargoIQ will recover — with zero commitment.
        </p>
        <div className="flex items-center justify-center gap-3 mb-8 text-cargoiq-deep/70">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">90 seconds to your first insight</span>
        </div>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-cargoiq-deep text-white px-8 py-4 text-lg font-semibold hover:bg-cargoiq-navy transition-colors"
        >
          Start My Free Shadow Audit
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
