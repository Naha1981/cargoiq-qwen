import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success:
    'border border-[color:var(--ok-pill-border)] bg-[color:var(--ok-pill-bg)] text-[color:var(--ok-pill-text)]',
  warning:
    'border border-[color:var(--warn-pill-border)] bg-[color:var(--warn-pill-bg)] text-[color:var(--warn-pill-text)]',
  error:
    'border border-[color:var(--risk-pill-border)] bg-[color:var(--risk-pill-bg)] text-[color:var(--risk-pill-text)]',
  info:
    'border border-[color:var(--info-pill-border)] bg-[color:var(--info-pill-bg)] text-[color:var(--info-pill-text)]',
  neutral:
    'border border-outline-variant bg-surface-container-high text-on-surface-variant',
};

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}