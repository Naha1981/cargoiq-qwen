import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' https://accounts.clerk.com https://cdn.clerk.com; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "img-src 'self' data:; " +
              "connect-src 'self' https://api.clerk.com https://accounts.clerk.com https://cdn.clerk.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io; " +
              "frame-ancestors 'self'; " +
              "base-uri 'self'; " +
              "form-action 'self';",
          },
        ],
      },
    ];
  },
};

// withSentryConfig no-ops safely when SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN
// are unset -- source-map upload is skipped, runtime error capture still works
// via the DSN alone. Satisfies the zero-env-var build requirement.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: false,
});
