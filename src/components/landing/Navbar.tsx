'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Platform', href: '#platform' },
    { label: 'How It Works', href: '#workflow' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Roadmap', href: '/roadmap' },
  ];

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 h-[80px] flex items-center justify-between px-6 md:px-10 lg:px-16 transition-all duration-200',
        scrolled ? 'backdrop-blur-md bg-[#2A0B04]/60' : 'bg-transparent'
      )}
    >
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A3C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A0B04]" aria-label="CargoIQ home">
          <Logo size="md" dark />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-[var(--font-body-md)] text-[14px] font-medium text-white/80 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A3C]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="h-[44px] inline-flex items-center px-4 font-[var(--font-body-md)] text-[14px] font-medium text-white/90 hover:text-white border border-white/25 hover:border-white/50 transition-all rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A3C]"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="h-[44px] inline-flex items-center gap-2 px-5 ember-button font-[var(--font-body-md)] text-[14px] font-semibold rounded-[4px] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#F2451C]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A3C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A0B04]"
        >
          Start Free Audit
        </Link>
      </div>
    </nav>
  );
}
