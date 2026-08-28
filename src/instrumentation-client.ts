import * as Sentry from '@sentry/nextjs';

// No-ops safely when NEXT_PUBLIC_SENTRY_DSN is unset -- satisfies the
// zero-env-var build requirement (NahaLabs build-resilience standard).
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  // Session replay is opt-in and disabled by default -- CargoIQ handles
  // compliance-sensitive documents; do not capture screen content unless
  // explicitly reviewed and enabled later.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  debug: false,
});
