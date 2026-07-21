'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';

export function ShadowAuditSection() {
  return (
    <section className="bg-[#B8860B] py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Run a free audit before you make any decision.
        </h2>
        <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
          Our 90-second shadow audit connects to your existing documents and shows you exactly what CargoIQ will recover — with zero commitment.
        </p>
        <div className="flex items-center justify-center gap-3 mb-8 text-white/80">
          <Clock className="w-5 h-5" />
          <span className="font-medium">90 seconds to your first insight</span>
        </div>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-white text-[#1A2332] px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
        >
          Start My Free Shadow Audit
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
