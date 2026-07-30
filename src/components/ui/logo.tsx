import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  /** dark=true renders "Cargo" in white (for the EMBER marketing background).
   *  dark=false (default) renders "Cargo" near-black (for the CIVIC white app). */
  dark?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
};

export function Logo({ size = 'md', dark = false, className }: LogoProps) {
  return (
    <span
      className={cn('inline-flex font-[var(--font-display-lg)] tracking-tight', sizeStyles[size], className)}
      style={{ letterSpacing: '-0.02em' }}
    >
      <span className="font-bold" style={{ color: dark ? '#FFFFFF' : '#101318' }}>
        Cargo
      </span>
      {/* "IQ" always uses the ember gradient text-fill (both themes) */}
      <span className="font-bold iq-gradient">IQ</span>
    </span>
  );
}
