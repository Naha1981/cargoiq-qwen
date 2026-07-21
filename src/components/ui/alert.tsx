import React from 'react';
import { cn } from '@/lib/utils';

type AlertVariant = 'success' | 'warning' | 'error' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const variantStyles: Record<AlertVariant, string> = {
  success: 'border-green-200 bg-green-50 text-green-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

export function Alert({ variant = 'info', title, description, icon, className, children }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn('rounded-lg border p-4', variantStyles[variant], className)}
    >
      <div className="flex gap-3">
        {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
        <div className="flex-1">
          {title && <h4 className="font-semibold">{title}</h4>}
          {(description || children) && (
            <p className="mt-1 text-sm opacity-90">
              {description || children}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}