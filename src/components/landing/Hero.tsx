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
    <section className="relative min-h-screen bg-cargoiq-navy flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-cargoiq-navy">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(184,134,11,0.08)_1px,transparent_1px)] bg-[length:24px_24px] opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-br from-cargoiq-gold/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cargoiq-navy to-transparent" />
      </div>
      <Navbar />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-20 flex-grow flex flex-col items-center justify-center">
        <div className="mb-8">
          <Logo size="lg" dark />
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-cargoiq-fg leading-[1.1] mb-6 tracking-tight">
          Stop Losing
          <br />
          <span className="font-mono text-cargoiq-goldLight" style={{ textShadow: '0 0 40px rgba(212,160,23,0.25)' }}>
            R{count.toLocaleString('en-ZA')}
          </span>
          <br />
          <span className="text-4xl md:text-5xl lg:text-6xl text-cargoiq-muted">a Month.</span>
        </h1>
        <p className="text-lg md:text-xl text-cargoiq-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          South Africa&apos;s first AI-powered compliance and cost-containment platform for freight forwarders and customs clearing agents.
        </p>
        <Link
          href="/calculator"
          className="inline-flex items-center gap-2 bg-cargoiq-gold text-white px-8 py-4 text-lg font-semibold hover:bg-cargoiq-goldHover transition-colors shadow-lg shadow-cargoiq-gold/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cargoiq-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cargoiq-navy"
        >
          Run My Free Shadow Audit
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div className="mt-16 flex items-center justify-center gap-3">
          <div className="w-px h-8 bg-cargoiq-subtle" />
          <TrendingDown className="w-5 h-5 text-cargoiq-red" />
          <span className="font-mono text-2xl md:text-3xl font-bold text-cargoiq-red">
            R{count.toLocaleString('en-ZA')}
          </span>
          <span className="text-cargoiq-muted text-sm uppercase tracking-widest">/month leaked</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cargoiq-subtle to-transparent" />
    </section>
  );
}
