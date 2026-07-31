'use client';

import { SignUp } from '@clerk/nextjs';
import { Logo } from '@/components/ui/logo';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col lg:flex-row">
      {/* Left: value panel (CIVIC white/light with ember gradient accent heading).
          The mono exposure figure is illustrative sample data — never a live "connected" claim. */}
      <aside className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-surface-container-low border-r border-outline-variant">
        <Logo size="md" />

        <div className="max-w-md">
          <h2 className="font-headline-lg text-headline-lg text-on-surface leading-tight">
            Customs compliance,<br />
            <span className="ember-text">audited and reclaimed.</span>
          </h2>
          <p className="mt-4 font-body-md text-on-surface-variant">
            CargoIQ scans every shipment for overcharges, misclassifications and
            compliance gaps — then turns the findings into recoverable savings.
          </p>

          <div className="mt-8 rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Exposure identified (sample audit)
            </p>
            <p className="font-data-tabular text-3xl font-bold text-risk-red mono mt-1">
              R 88 400
            </p>
            <p className="font-label-caps text-label-caps text-on-surface-variant mt-1">
              Illustrative figure — run a Shadow Audit on your own documents for verified results.
            </p>
          </div>
        </div>

        <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
          South Africa&apos;s AI-powered customs compliance platform
        </p>
      </aside>

      {/* Right: real Clerk <SignUp> (themed via the root ClerkProvider appearance) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 lg:hidden">
          <Logo size="lg" />
        </div>
        <div className="w-full max-w-md">
          <SignUp
            routing="path"
            path="/signup"
            signInUrl="/login"
            fallbackRedirectUrl="/dashboard"
          />
        </div>
      </main>
    </div>
  );
}
