import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-on-surface-variant">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-lg border border-outline bg-surface-container px-3 py-2 text-sm text-on-surface shadow-sm transition-colors',
          'placeholder:text-[var(--outline-text)]',
          'focus:border-[var(--ember-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--ember-focus)]/20',
          error && 'border-error focus:border-error focus:ring-error/20',
          'disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-on-surface-variant',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}