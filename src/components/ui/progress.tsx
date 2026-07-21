import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  color?: 'amber' | 'green' | 'red';
  size?: 'sm' | 'md';
  className?: string;
}

const colorStyles = {
  amber: 'bg-amber-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
};

export function Progress({ value, color = 'amber', size = 'md', className }: ProgressProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-full bg-gray-200',
        sizeStyles[size],
        className
      )}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-300 ease-in-out', colorStyles[color])}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}