'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

const columns = [
  {
    title: 'Platform',
    links: [
      { name: 'Shadow Audit', href: '#platform' },
      { name: 'Compliance Shield', href: '#platform' },
      { name: 'Carrier Invoice Auditor', href: '#platform' },
      { name: 'Container Tracking', href: '#platform' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { name: 'Clearing Agents', href: '/signup' },
      { name: 'Freight Forwarders', href: '/signup' },
      { name: 'Importers', href: '/signup' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'How It Works', href: '#workflow' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Roadmap', href: '/roadmap' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About CargoIQ', href: '#' },
      { name: 'Contact', href: 'mailto:hello@cargoiq.io' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Terms of Service', href: '#' },
      { name: 'Privacy Policy', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#1A0703] border-t border-white/10 pt-20 pb-10 px-6 md:px-10 lg:px-16">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-16">
          <div className="col-span-2">
            <Logo size="md" dark />
            <p className="mt-4 font-[var(--font-body-md)] text-[14px] text-white/55 max-w-xs leading-relaxed">
              High-stakes customs compliance and cost-recovery for the South African logistics sector.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="#" aria-label="Website" className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-white/15 text-white/60 hover:text-white hover:border-[#F2451C]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A3C]">
                <span className="material-symbols-outlined text-[18px]">public</span>
              </a>
              <a href="#" aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-white/15 text-white/60 hover:text-white hover:border-[#F2451C]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A3C]">
                <span className="material-symbols-outlined text-[18px]">share</span>
              </a>
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-[var(--font-body-md)] text-[11px] font-semibold uppercase tracking-[0.08em] text-white mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="font-[var(--font-body-md)] text-[14px] text-white/55 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/10">
          <span className="font-[var(--font-body-md)] text-[12px] text-white/45">
            &copy; 2026 CargoIQ. All rights reserved.
          </span>
          <span className="font-[var(--font-body-md)] text-[12px] text-white/45">
            A South African customs-compliance platform.
          </span>
        </div>
      </div>
    </footer>
  );
}
