import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
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
      className={cn(
        'inline-flex font-sans tracking-tight',
        sizeStyles[size],
        className
      )}
      style={{ letterSpacing: '-0.02em' }}
    >
      <span className="font-bold" style={{ color: dark ? '#FFFFFF' : '#1A2332' }}>
        Cargo
      </span>
      <span className="font-bold" style={{ color: dark ? '#D4922B' : '#B8860B' }}>
        IQ
      </span>
    </span>
  );
}