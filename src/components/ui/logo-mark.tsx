import { cn } from '@/lib/utils';

interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 64 48"
      className={cn('h-5 w-auto shrink-0', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="12" width="24" height="16" rx="2" />
        <path d="M32 18h10" />
        <path d="M42 18l8-4" />
        <path d="M32 24h10" />
        <path d="M42 24l8 4" />
        <path d="M32 28h6" />
        <circle cx="20" cy="33" r="4" />
      </g>
      <g stroke="#F97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10L10 10" />
        <path d="M20 16L7 16" />
        <path d="M22 22L6 22" />
        <path d="M20 28L10 28" />
      </g>
    </svg>
  );
}
