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
    <footer className="bg-[#1A2332] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Logo size="lg" dark />
            <p className="text-gray-400 text-sm max-w-xs text-center md:text-left">
              South Africa&apos;s first AI-powered compliance and cost-containment platform for freight forwarders and customs clearing agents.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} CargoIQ by NahaLabs (Pty) Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
