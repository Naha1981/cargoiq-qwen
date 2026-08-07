import React from 'react';
import { cn } from '@/lib/utils';
import { LogoMark } from './logo-mark';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  /** dark=true keeps the wordmark readable over the ember marketing background. */
  dark?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'text-[1.05rem]',
  md: 'text-[1.4rem]',
  lg: 'text-[2rem]',
};

const markStyles = {
  sm: 'h-5 w-5',
  md: 'h-7 w-7',
  lg: 'h-9 w-9',
};

export function Logo({ size = 'md', dark = false, className }: LogoProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-2 font-[var(--font-display-lg)] tracking-[-0.03em] font-extrabold italic', sizeStyles[size], className)}
    >
      <LogoMark className={markStyles[size]} />
      <span className="leading-none" style={{ color: dark ? '#FFFFFF' : 'currentColor' }}>
        <span className="text-[inherit]">Cargo</span>
        <span className="ml-0.5 text-[#F97316]">IQ</span>
      </span>
    </span>
  );
}
