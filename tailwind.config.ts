import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cargoiq: {
          bg: '#F1F4F8',
          navy: '#1A2332',
          panel: '#141B29',
          deep: '#0F1620',
          gold: '#B8860B',
          goldHover: '#D4922B',
          goldLight: '#D4A017',
          green: '#16A34A',
          red: '#DC2626',
          fg: '#F1F4F8',
          muted: '#9AA7B8',
          textPrimary: '#0D1B2A',
          textSecondary: '#4A5568',
          border: '#E2E8F0',
          warning: '#D97706',
          canvas: '#F1F4F8',
          subtle: 'rgba(255, 255, 255, 0.08)',
        },
        sentinel: {
          bg: '#020817',
          card: '#0F172A',
          text: '#F8FAFC',
          counterRed: '#EF4444',
          counterGreen: '#22C55E',
          counterBlue: '#3B82F6',
        },
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'Arial', 'Helvetica', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
