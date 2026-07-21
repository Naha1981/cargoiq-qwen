'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingDown } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Navbar } from './Navbar';

export function Hero() {
  const [count, setCount] = useState(217340);
  const target = 217340;

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen bg-[#1A2332] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#B8860B]/20 to-transparent" />
      </div>
      <Navbar />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <div className="mb-8">
          <Logo size="lg" dark />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
          Stop Losing
          <br />
          <span className="text-[#B8860B]">
            R{count.toLocaleString('en-ZA')}
          </span>{' '}
          a Month.
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          South Africa&apos;s first AI-powered compliance and cost-containment platform for freight forwarders and customs clearing agents.
        </p>
        <Link
          href="/calculator"
          className="inline-flex items-center gap-2 bg-[#B8860B] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#D4922B] transition-colors shadow-lg shadow-[#B8860B]/30"
        >
          Run My Free Shadow Audit
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div className="mt-16 flex items-center justify-center gap-3">
          <TrendingDown className="w-6 h-6 text-[#DC2626]" />
          <span className="font-mono text-3xl md:text-4xl font-bold text-[#EF4444]">
            R{count.toLocaleString('en-ZA')}
          </span>
          <span className="text-gray-400 text-lg">/month leaked</span>
        </div>
      </div>
    </section>
  );
}
