'use client';

import React from 'react';
import { Upload, Search, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Documents',
    body: 'Sync your EDI, scan Bill of Ladings, or upload carrier invoices directly.',
  },
  {
    icon: Search,
    title: 'Seven Compliance Checks',
    body: 'Our engine runs 7 proprietary audits against SARS and carrier datasets.',
  },
  {
    icon: TrendingUp,
    title: 'Recover Revenue',
    body: 'Automated recovery notes are sent to carriers and SARS disputes filed.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-margin-page bg-surface" id="workflow">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-headline-lg text-headline-lg mb-20 text-center uppercase industrial-tracking">Three Steps to Recovery</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-outline-variant -z-10"></div>
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="w-24 h-24 bg-surface-container-high border-technical flex items-center justify-center mx-auto mb-6 group-hover:border-primary transition-colors">
                <span className="font-display-lg text-headline-lg text-primary">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-4">{step.title}</h3>
              <p className="text-on-surface-variant">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
