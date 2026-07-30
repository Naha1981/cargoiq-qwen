'use client';

import React from 'react';

interface Feature {
  icon: string;
  name: string;
  description: string;
  span: string;
  badge?: { label: string; tone: 'critical' | 'high' | 'whatsapp' | 'expiring' | 'neutral' };
  accent?: boolean;
}

/* Verified one-liners per spec (NOT the garbled Stitch OCR). */
const features: Feature[] = [
  {
    icon: 'security',
    name: 'Compliance Shield',
    description: 'Automated customs compliance checks against SARS regulations and IEC Incoterms.',
    span: 'md:col-span-5 md:row-span-2',
    badge: { label: 'MOST CRITICAL', tone: 'critical' },
    accent: true,
  },
  {
    icon: 'fact_check',
    name: 'CarrierInvoice Auditor',
    description: 'AI detects freight invoice anomalies, duplicates, and pricing discrepancies.',
    span: 'md:col-span-4 md:row-span-1',
  },
  {
    icon: 'location_on',
    name: 'Driver Check-In',
    description:
      'WhatsApp driver arrival and departure timestamps with automatic billable-detention invoices. No app, no GPS hardware.',
    span: 'md:col-span-3 md:row-span-1',
    badge: { label: 'WhatsApp', tone: 'whatsapp' },
  },
  {
    icon: 'monitoring',
    name: 'RLA Sentinel',
    description:
      'Daily monitoring of every importer\u2019s SARS Registered Local Agent (RLA) status — alerts to a suspension before you submit a single SAD500.',
    span: 'md:col-span-4 md:row-span-2',
    badge: { label: 'EXPIRING IN 14 DAYS', tone: 'expiring' },
  },
  {
    icon: 'category',
    name: 'HS Code Classifier',
    description:
      'AI HS code classification validated against the SARS 8-digit tariff book, with tariff-amendment alerts.',
    span: 'md:col-span-3 md:row-span-1',
  },
  {
    icon: 'analytics',
    name: 'Shadow Audit',
    description:
      'Re-runs all 7 compliance checks over your historical shipments and shows your exact Rand exposure — proof before you pay.',
    span: 'md:col-span-5 md:row-span-1',
  },
  {
    icon: 'tracking',
    name: 'Container Tracking',
    description: 'End-to-end container visibility with ETA prediction and exception handling.',
    span: 'md:col-span-3 md:row-span-1',
  },
  {
    icon: 'gavel',
    name: 'Section 99(2) Tracker',
    description:
      'Personal liability risk monitoring for customs clearing agents under the Customs Act.',
    span: 'md:col-span-4 md:row-span-1',
    badge: { label: 'HIGH RISK', tone: 'high' },
  },
  {
    icon: 'workspace_premium',
    name: 'Savings Certificate',
    description:
      'Verified monthly savings certificate — boardroom-ready proof of value for management and auditors.',
    span: 'md:col-span-5 md:row-span-1',
  },
];

const badgeTone: Record<NonNullable<Feature['badge']>['tone'], string> = {
  critical: 'bg-[#F2451C] text-white',
  high: 'bg-[#3a0d06] text-[#FF9A6B] border border-[#F2451C]/40',
  whatsapp: 'bg-[#1B3A2B] text-[#5BD49A] border border-[#027A48]/50',
  expiring: 'bg-[#3a2406] text-[#E8B84B] border border-[#B54708]/50',
  neutral: 'bg-white/10 text-white/70',
};

export function FeaturesGrid() {
  return (
    <section className="py-[104px] px-6 md:px-10 lg:px-16 bg-[#2A0B04]" id="platform">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-14">
          <span className="font-[var(--font-body-md)] text-[12px] font-semibold uppercase tracking-[0.08em] text-[#FF7A3C]">
            The CargoIQ Platform
          </span>
          <h2 className="mt-3 font-[var(--font-display-lg)] text-white font-bold text-[32px] sm:text-[40px] tracking-[-0.03em]">
            Built for high-velocity freight
          </h2>
          <p className="mt-4 font-[var(--font-body-md)] text-[16px] text-white/65 max-w-2xl">
            Nine modules, one platform — every shipment checked, every Rand accounted for.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:auto-rows-[180px]">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`${feature.span} group relative flex flex-col justify-between rounded-[6px] border ${
                feature.accent ? 'border-[#F2451C]/40 bg-gradient-to-br from-[#3a0d06] to-[#1F0803]' : 'border-white/10 bg-white/[0.03]'
              } p-6 transition-all hover:border-[#F2451C]/50 hover:bg-white/[0.06]`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <span className="material-symbols-outlined text-[#FF7A3C] text-[32px]">{feature.icon}</span>
                  {feature.badge && (
                    <span
                      className={`inline-flex items-center rounded-[3px] px-2 py-1 font-[var(--font-body-md)] text-[10px] font-semibold uppercase tracking-wider ${badgeTone[feature.badge.tone]}`}
                    >
                      {feature.badge.label}
                    </span>
                  )}
                </div>
                <h3 className="font-[var(--font-display-lg)] text-white font-semibold text-[18px] mb-2">
                  {feature.name}
                </h3>
                <p className="font-[var(--font-body-md)] text-[13.5px] leading-relaxed text-white/65">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
