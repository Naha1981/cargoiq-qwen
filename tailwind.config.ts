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
          gold: '#B8860B',
          green: '#16A34A',
          red: '#DC2626',
        },
      },
    },
  },
  plugins: [],
};

export default config;
