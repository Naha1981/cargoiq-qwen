'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'cargoiq-theme';

/**
 * Light/Dark segmented control.
 * Default = Light. On change: writes localStorage 'cargoiq-theme' and toggles
 * the `dark` class on document.documentElement immediately (no reload).
 * Mounted state avoids hydration mismatch — the no-flash head script already
 * applied the correct class before paint, so we read the live DOM on mount.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof document !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    }
  }, []);

  const apply = (next: Theme) => {
    setTheme(next);
    if (typeof document === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors (private mode etc.)
    }
    const cl = document.documentElement.classList;
    if (next === 'dark') cl.add('dark');
    else cl.remove('dark');
  };

  const options: { id: Theme; label: string; icon: typeof Sun }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center rounded-lg border border-outline-variant bg-surface-container-high p-0.5"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = mounted && theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => apply(opt.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'ember-button text-white'
                : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            <Icon className="h-4 w-4" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default ThemeToggle;
