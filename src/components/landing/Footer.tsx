'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

const footerLinks = [
  { name: 'Product', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Privacy Policy', href: '#' },
  { name: 'Terms of Service', href: '#' },
];

export function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant pt-20 pb-10 px-margin-page">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-20">
        <div className="col-span-1 md:col-span-1">
          <Logo size="lg" dark />
          <p className="text-on-surface-variant text-body-md mb-6">High-stakes customs compliance and cost-recovery for the South African logistics sector.</p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">public</span>
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">share</span>
          </div>
        </div>
        <div>
          <h4 className="font-label-caps text-label-caps text-on-surface mb-6 uppercase tracking-widest">Platform</h4>
          <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant">
            <li><a className="hover:text-primary transition-colors" href="#">Shadow Audit</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">RLA Sentinel</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">HS Classification</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Container Tracking</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-caps text-label-caps text-on-surface mb-6 uppercase tracking-widest">Company</h4>
          <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant">
            <li><a className="hover:text-primary transition-colors" href="#">About CargoIQ</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Carrier Network</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Security Status</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-caps text-label-caps text-on-surface mb-6 uppercase tracking-widest">Legal</h4>
          <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant">
            <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-outline-variant">
        <span className="font-label-caps text-label-caps text-outline uppercase">© 2024 CargoIQ Customs Compliance. All rights reserved.</span>
      </div>
    </footer>
  );
}
