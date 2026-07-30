'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

const visionCards = [
  {
    title: 'Global Network Health',
    tagline: 'Mission control',
    icon: 'public',
  },
  {
    title: 'Carrier Onboarding Portal',
    tagline: 'Ecosystem gateway',
    icon: 'hub',
  },
  {
    title: 'Compliance Resource Center',
    tagline: 'Regulatory shield',
    icon: 'menu_book',
  },
  {
    title: 'Analytics Vault',
    tagline: 'Recovery velocity',
    icon: 'monitoring',
  },
  {
    title: 'Custom Report Builder',
    tagline: 'Bespoke precision',
    icon: 'architecture',
  },
  {
    title: 'Carrier Dispute Resolution Hub',
    tagline: 'Legal fortress',
    icon: 'balance',
  },
  {
    title: 'Audit Results Timeline',
    tagline: 'Chronos insight',
    icon: 'timeline',
    wide: true,
  },
];

export default function RoadmapPage() {
  return (
    <main className="min-h-screen ember-bg text-white">
      {/* Top bar — slim, links back to marketing site */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#2A0B04]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" aria-label="CargoIQ home">
            <Logo className="text-lg" dark />
          </Link>
          <nav className="flex items-center gap-6 text-sm text-white/70">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/roadmap" className="text-white" aria-current="page">Roadmap</Link>
            <Link
              href="/login"
              className="rounded-full bg-[linear-gradient(135deg,#7E2410_0%,#C83A12_50%,#F2451C_100%)] px-5 py-2 font-semibold text-white shadow-lg shadow-[#C83A12]/25 hover:opacity-95"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-16 pt-20 md:pt-28">
        <div className="ember-bg-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <span className="coming-soon-badge inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
            Future State
          </span>
          <h1 className="mt-6 max-w-3xl font-display-lg text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Roadmap <span className="ember-accent">Vision</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            Engineered for the future of South African logistics. Our vision extends beyond recovery —
            building a resilient, high-velocity customs infrastructure. Nothing below is available today;
            each card is a direction we are building toward.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="relative px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visionCards.map((card, index) => (
              <article
                key={index}
                className={`group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm transition-all duration-500 hover:border-[#FF7A3C]/50 hover:bg-white/[0.06] ${
                  card.wide ? 'lg:col-span-3' : ''
                }`}
              >
                <div className="mb-7 flex items-start justify-between gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-xl border border-white/10 bg-[#2A0B04]/60 text-[#FF7A3C] transition-transform duration-500 group-hover:scale-110">
                    <span className="material-symbols-outlined text-3xl" aria-hidden="true">
                      {card.icon}
                    </span>
                  </div>
                  <span className="coming-soon-badge inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest">
                    Coming in a future release
                  </span>
                </div>
                <h2 className="mb-2 font-display-lg text-2xl font-bold tracking-tight">
                  {card.title}
                </h2>
                <p className="mb-6 leading-relaxed text-white/60">
                  {card.wide
                    ? 'Visualize multi-year compliance histories and audit trajectories in a single interactive chronological view. Identify systemic risks before they trigger critical interventions.'
                    : 'This feature is under active development and will be available in a future release.'}
                </p>
                <div className="mt-auto border-t border-white/10 pt-4">
                  <span className="ember-accent text-xs font-semibold uppercase tracking-widest">
                    {card.tagline}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <div className="select-none font-display-lg text-3xl font-bold opacity-40">
            <Logo className="text-3xl" dark />
          </div>
          <p className="font-body-md text-sm italic text-white/50">
            © 2026 CargoIQ. Roadmap vision assets are subject to regulatory shifts and technical
            evolution. All rights reserved. A South African customs-compliance platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <a
              href="mailto:hello@cargoiq.co.za"
              className="ember-button rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-95"
            >
              Contact Strategy Team
            </a>
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              Request Beta Access
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
