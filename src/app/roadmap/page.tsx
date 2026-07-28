'use client';

import React from 'react';

const visionCards = [
  {
    title: 'Global Network Health',
    tagline: '"mission control"',
    icon: 'public',
  },
  {
    title: 'Carrier Onboarding Portal',
    tagline: '"ecosystem gateway"',
    icon: 'hub',
  },
  {
    title: 'Compliance Resource Center',
    tagline: '"regulatory shield"',
    icon: 'menu_book',
  },
  {
    title: 'Analytics Vault',
    tagline: '"recovery velocity"',
    icon: 'monitoring',
  },
  {
    title: 'Custom Report Builder',
    tagline: '"bespoke precision"',
    icon: 'architecture',
  },
  {
    title: 'Carrier Dispute Resolution Hub',
    tagline: '"legal fortress"',
    icon: 'balance',
  },
  {
    title: 'Audit Results Timeline',
    tagline: '"chronos insight"',
    icon: 'timeline',
    wide: true,
  },
];

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-hull text-on-surface">
      <header className="pt-20 pb-12 px-margin-page border-b border-outline-variant bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary px-3 py-1 font-label-caps text-label-caps border border-primary/20 tracking-widest uppercase">Future State</span>
              <div className="h-[1px] w-12 bg-outline-variant"></div>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface tracking-tighter">Roadmap <span className="text-primary">Vision</span></h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Engineered for the future of South African logistics. Our vision extends beyond recovery — building a resilient, high-velocity customs infrastructure.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="font-data-tabular text-on-surface-variant text-xs opacity-50">SYSTEM_UPTIME: 99.98%</span>
            <span className="font-data-tabular text-on-surface-variant text-xs opacity-50">NEXT_DEPLOY_WINDOW: Q3_2024</span>
          </div>
        </div>
      </header>
      <section className="py-16 px-margin-page">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {visionCards.map((card, index) => (
              <div
                key={index}
                className={`group relative flex flex-col bg-surface-container-low border border-outline-variant hover:border-primary/40 transition-all duration-500 gloss-effect p-8 ${card.wide ? 'lg:col-span-3' : ''}`}
              >
                <div className="mb-8 flex justify-between items-start">
                  <div className="p-3 bg-surface-container-highest border border-outline-variant text-primary group-hover:scale-110 transition-transform duration-500">
                    <span className="material-symbols-outlined text-3xl">{card.icon}</span>
                  </div>
                  <div className="coming-soon-badge px-3 py-1.5 font-label-caps text-[10px] uppercase text-primary/80 tracking-widest animate-status">Coming in a future release</div>
                </div>
                <h3 className="font-headline-md text-headline-md mb-2 group-hover:text-primary transition-colors">{card.title}</h3>
                <p className="font-body-md text-on-surface-variant mb-6 leading-relaxed">
                  {card.wide
                    ? 'Visualize multi-year compliance histories and audit trajectories in a single interactive chronological view. Identify systemic risks before they trigger critical interventions.'
                    : 'This feature is under active development and will be available in a future release.'}
                </p>
                <div className="mt-auto pt-4 border-t border-outline-variant/30">
                  <span className="font-label-caps text-label-caps text-primary/60 italic">{card.tagline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="py-20 px-margin-page bg-surface-container-lowest border-t border-outline-variant">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="font-display-lg text-headline-md text-on-surface opacity-40 select-none">Cargo<span className="text-on-secondary-container bg-secondary-container px-1">IQ</span> Compliance</div>
          <p className="font-body-md text-on-surface-variant italic opacity-60">
            © 2024 CargoIQ Customs Compliance. Roadmap vision assets are subject to regulatory shifts and technical evolution. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 pt-4">
            <button className="px-6 py-3 bg-primary text-on-primary font-label-caps tracking-widest uppercase hover:bg-primary-fixed transition-colors">Contact Strategy Team</button>
            <button className="px-6 py-3 border border-outline-variant font-label-caps tracking-widest uppercase hover:bg-surface-container transition-colors">Request Beta Access</button>
          </div>
        </div>
      </footer>
    </main>
  );
}