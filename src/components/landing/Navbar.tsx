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
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#workflow' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant h-16 flex items-center justify-between px-margin-page transition-all duration-200'
      )}
    >
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <Logo size="md" dark />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="px-4 py-2 font-label-caps text-label-caps text-on-surface-variant border border-outline-variant hover:bg-surface-container-high transition-all"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 font-label-caps text-label-caps bg-primary-container text-on-primary-container hover:opacity-90 transition-all font-bold"
        >
          Start Free Audit
        </Link>
      </div>
    </nav>
  );
}
