import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export function Card({ title, subtitle, children, className, footer }: CardProps) {
  return (
    <div className={cn('rounded-xl border border-outline-variant bg-surface-container shadow-sm', className)}>
      {(title || subtitle) && (
        <div className="border-b border-outline-variant px-6 py-4">
          {title && <h3 className="text-lg font-semibold text-on-surface">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && <div className="border-t border-outline-variant px-6 py-4">{footer}</div>}
    </div>
  );
}