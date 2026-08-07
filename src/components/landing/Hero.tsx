'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Navbar } from './Navbar';

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden ember-bg">
      {/* soft radial glow on the right */}
      <div className="pointer-events-none absolute inset-0 ember-bg-glow" aria-hidden />

      <Navbar />

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center pt-10 pb-[140px]">
          {/* ---- Left: copy ---- */}
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-3 py-1 font-[var(--font-body-md)] text-[11px] font-semibold uppercase tracking-[0.08em] text-white/90">
              AI-Powered Freight Audit &amp; Recovery
            </span>

            <h1 className="mt-6 font-[var(--font-display-lg)] text-white font-bold leading-[1.05] tracking-[-0.03em] text-4xl sm:text-5xl lg:text-6xl">
              Your freight operations
              <br className="hidden sm:block" /> are{' '}
              <span className="ember-accent">bleeding.</span>
            </h1>
            <p className="mt-3 font-[var(--font-display-lg)] text-[22px] sm:text-[26px] font-semibold ember-accent leading-tight">
              You just cannot see where.
            </p>

            <p className="mt-6 font-[var(--font-body-md)] text-[16px] sm:text-[18px] leading-relaxed text-white/85 max-w-xl">
              Carrier overcharges, SARS storage penalties, unbilled waiting time and RLA
              suspensions are draining your margin in silence. CargoIQ finds the leakage —
              and recovers it.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/signup"
                className="group h-[52px] inline-flex items-center gap-2 px-7 ember-button font-[var(--font-body-md)] text-[16px] font-semibold rounded-[6px] transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#F2451C]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A3C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A0B04]"
              >
                Activate Your Free Trial
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#workflow"
                className="h-[52px] inline-flex items-center gap-2 px-6 border border-white/30 hover:border-white/60 text-white font-[var(--font-body-md)] text-[16px] font-semibold rounded-[6px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A3C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A0B04]"
              >
                <Play className="h-4 w-4" />
                See How It Works
              </Link>
            </div>

            <p className="mt-6 font-[var(--font-body-md)] text-[13px] text-white/70">
              No credit card required — your free shadow audit runs in seconds.
            </p>
          </div>

          {/* ---- Right: CSS/SVG product-preview card ---- */}
          <div className="relative">
            <div className="relative rounded-[8px] border border-white/15 bg-[#1A0703]/70 backdrop-blur-sm p-6 shadow-2xl shadow-black/40">
              {/* window chrome */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <Logo size="sm" dark />
                </div>
                <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 font-[var(--font-body-md)] text-[10px] font-semibold uppercase tracking-wider text-white/60">
                  Preview / Sample
                </span>
              </div>

              {/* KPI grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Exposure Found', value: 'R 945 000', tone: 'risk' },
                  { label: 'Documents Audited', value: '1 284', tone: 'plain' },
                  { label: 'Recovery Rate', value: '94.2%', tone: 'plain' },
                  { label: 'Checks / Document', value: '7', tone: 'plain' },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-[6px] border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-[var(--font-body-md)] text-[10px] uppercase tracking-wider text-white/55">
                      {kpi.label}
                    </p>
                    <p
                      className={`mt-1 font-[var(--font-mono)] text-[20px] font-semibold text-right ${
                        kpi.tone === 'risk' ? 'text-[#FF7A3C]' : 'text-white'
                      }`}
                    >
                      {kpi.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* sparkline */}
              <div className="mt-4 rounded-[6px] border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-[var(--font-body-md)] text-[10px] uppercase tracking-wider text-white/55">
                    Recovery Trend
                  </p>
                  <span className="font-[var(--font-body-md)] text-[10px] text-[#FF7A3C]">▲ illustrative</span>
                </div>
                <svg className="w-full h-16" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden>
                  <defs>
                    <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F2451C" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#F2451C" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,48 L30,42 L60,46 L90,34 L120,38 L150,26 L180,30 L210,18 L240,22 L270,10 L300,6 L300,60 L0,60 Z" fill="url(#spark-fill)" />
                  <path
                    d="M0,48 L30,42 L60,46 L90,34 L120,38 L150,26 L180,30 L210,18 L240,22 L270,10 L300,6"
                    fill="none"
                    stroke="#FF7A3C"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <span className="pointer-events-none absolute -bottom-3 right-4 rounded-full border border-white/20 bg-[#2A0B04] px-2 py-0.5 font-[var(--font-body-md)] text-[9px] uppercase tracking-wider text-white/50">
              CSS / SVG render — no live data
            </span>
          </div>
        </div>
      </div>

      {/* ---- Honest trust strip (NOT a logo wall) ---- */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#2A0B04]/50 backdrop-blur-sm py-5">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-16">
          <p className="text-center font-[var(--font-body-md)] text-[13px] text-white/70">
            Built for SARS-licensed clearing agents &amp; freight forwarders across South Africa.
          </p>
        </div>
      </div>
    </section>
  );
}
