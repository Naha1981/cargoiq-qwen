'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Navbar } from './Navbar';
import { LeakageShader } from './LeakageShader';

export function Hero() {
  const [count, setCount] = useState(1248500);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = 1248500 / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= 1248500) {
        setCount(1248500);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center items-start px-margin-page overflow-hidden pt-16">
      <div className="absolute inset-0 -z-10 opacity-40">
        <LeakageShader />
      </div>
      <Navbar />
      <div className="max-w-4xl space-y-6">
        <h1 className="font-display-lg text-display-lg industrial-tracking text-on-surface uppercase font-extrabold max-w-3xl">
          Your freight operation is bleeding. <span className="text-primary-container">You just cannot see where.</span>
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
          Carrier overcharges, SARS storage penalties, unbilled waiting time, and RLA suspensions are draining your margin in silence. CargoIQ stops the leak.
        </p>
        <div className="flex flex-col gap-4 pt-4">
          <div className="flex items-center gap-4">
            <Link
              href="/calculator"
              className="px-8 py-4 bg-primary-container text-on-primary-container font-display-lg text-body-lg font-bold flex items-center gap-2 hover:translate-y-[-2px] transition-all active:translate-y-0"
            >
              Run My Free Shadow Audit
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <p className="font-label-caps text-label-caps text-outline flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            The verified number is yours — it comes from your free shadow audit, not from us.
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full bg-surface-container-low border-t border-outline-variant py-4 overflow-hidden">
        <div className="flex items-center gap-12 animate-scroll whitespace-nowrap">
          <div className="flex items-center gap-12">
            <span className="mono text-risk-red flex items-center gap-2"><span className="material-symbols-outlined">warning</span> MSCU4821 · detention · <span className="text-on-surface font-bold">R2 750</span> recovered</span>
            <span className="mono text-primary flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span> INV-2201 · duplicate · <span className="text-on-surface font-bold">R8 400</span> flagged</span>
            <span className="mono text-risk-red flex items-center gap-2"><span className="material-symbols-outlined">warning</span> SARS-PEN-92 · late-file · <span className="text-on-surface font-bold">R14 500</span> saved</span>
            <span className="mono text-primary flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span> MAEU-882 · waiting-time · <span className="text-on-surface font-bold">R3 200</span> recovered</span>
            <span className="text-primary font-bold px-8 border-x border-outline-variant">TOTAL RECOVERED THIS MONTH: <span className="mono">R{count.toLocaleString()}</span></span>
          </div>
          <div className="flex items-center gap-12">
            <span className="mono text-risk-red flex items-center gap-2"><span className="material-symbols-outlined">warning</span> MSCU4821 · detention · <span className="text-on-surface font-bold">R2 750</span> recovered</span>
            <span className="mono text-primary flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span> INV-2201 · duplicate · <span className="text-on-surface font-bold">R8 400</span> flagged</span>
            <span className="mono text-risk-red flex items-center gap-2"><span className="material-symbols-outlined">warning</span> SARS-PEN-92 · late-file · <span className="text-on-surface font-bold">R14 500</span> saved</span>
            <span className="mono text-primary flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span> MAEU-882 · waiting-time · <span className="text-on-surface font-bold">R3 200</span> recovered</span>
            <span className="text-primary font-bold px-8 border-x border-outline-variant">TOTAL RECOVERED THIS MONTH: <span className="mono">R{count.toLocaleString()}</span></span>
          </div>
        </div>
      </div>
    </section>
  );
}
