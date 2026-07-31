'use client';

import { useState } from 'react';
import { Globe, X, ShieldCheck, Lock } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

type PortalKey = 'sars' | 'maersk' | 'dct' | 'netsuite' | 'sweef';

interface Portal {
  key: PortalKey;
  name: string;
  description: string;
  status: 'not-connected';
}

const PORTALS: Portal[] = [
  {
    key: 'sars',
    name: 'SARS eFiling',
    description: 'South African Revenue Service eFiling integration for SAD500 submissions and duty assessments.',
    status: 'not-connected',
  },
  {
    key: 'maersk',
    name: 'Maersk Spot',
    description: 'Live vessel schedules, booking confirmations and invoice retrieval from Maersk.',
    status: 'not-connected',
  },
  {
    key: 'dct',
    name: 'DCT Durban',
    description: 'Durban Container Terminal gate moves and free-time tracking.',
    status: 'not-connected',
  },
  {
    key: 'netsuite',
    name: 'NetSuite',
    description: 'Sync landed-cost allocations and customs entries to your NetSuite books.',
    status: 'not-connected',
  },
  {
    key: 'sweef',
    name: 'Sweef',
    description: 'Freight forwarder rate cards and shipment milestones from Sweef.',
    status: 'not-connected',
  },
];

export default function PortalsPage() {
  const [openKey, setOpenKey] = useState<PortalKey | null>(null);
  const openPortal = PORTALS.find((p) => p.key === openKey) ?? null;
  const isSars = openPortal?.key === 'sars';

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Logo size="sm" />
          <span className="text-on-surface-variant font-normal">/</span>
          <h1 className="text-2xl font-bold text-on-surface font-body-md">
            Portals
          </h1>
        </div>
        <p className="text-sm text-on-surface-variant mb-6">
          Connect the customs and carrier portals CargoIQ reads from. None of
          these connections are active yet &mdash; configure a portal when you
          are ready.
        </p>

        {/* Honesty banner */}
        <div className="mb-6 flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-warn" />
          No portal is connected. These cards show the integrations CargoIQ
          supports; opening Configure lets you store credentials securely but
          will not mark a portal as connected until a live, verified
          connection succeeds.
        </div>

        {/* Portal grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PORTALS.map((portal) => (
            <div
              key={portal.key}
              className="rounded-md border border-outline-variant bg-surface-container-lowest p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant">
                    <Globe className="h-5 w-5 text-on-surface" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-on-surface">
                      {portal.name}
                    </h3>
                    <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-outline-variant" />
                      Not connected
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant mb-4 min-h-[32px]">
                {portal.description}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setOpenKey(portal.key)}
                  className="ember-button text-white px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
                >
                  Configure
                </button>
                <button
                  className="font-label-caps text-label-caps text-on-surface-variant cursor-not-allowed opacity-50 px-4 py-1.5 rounded-full border border-outline-variant"
                  disabled
                  title="Connection test is unavailable until credentials are saved"
                >
                  Test Connection
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configure drawer (white, right-side) */}
      {openPortal && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={`Configure ${openPortal.name}`}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenKey(null)}
          />
          {/* Panel */}
          <div className="relative h-full w-full max-w-md bg-surface-container-lowest border-l border-outline-variant shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-outline-variant">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant">
                  <Globe className="h-4 w-4 text-on-surface" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-on-surface">
                    Configure {openPortal.name}
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Not connected
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpenKey(null)}
                className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <p className="text-sm text-on-surface-variant">
                {openPortal.description}
              </p>

              {/* SARS honest gate */}
              {isSars && (
                <div className="rounded-md border border-warn/40 bg-warn/10 p-4">
                  <p className="text-sm font-medium text-warn flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Requires official SARS API access
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    SARS eFiling integration requires enrolment for the
                    official SARS API and an approved eFiling service profile.
                    CargoIQ will not connect to SARS without verified, official
                    SARS API access granted to your business.
                  </p>
                </div>
              )}

              {/* Credential form (non-functional until a real backend exists) */}
              <form
                className="space-y-3"
                onSubmit={(e) => e.preventDefault()}
              >
                <div>
                  <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                    {isSars ? 'SARS eFiling username' : 'API key'}
                  </label>
                  <input
                    type="text"
                    placeholder={isSars ? 'eFiling username' : 'Paste API key'}
                    className="w-full px-3 py-2 border border-outline-variant rounded text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                    {isSars ? 'eFiling password' : 'API secret'}
                  </label>
                  <input
                    type="password"
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    className="w-full px-3 py-2 border border-outline-variant rounded text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>

                {/* AES-256 note */}
                <div className="flex items-start gap-2 rounded-md border border-success/40 bg-success/10 p-3">
                  <Lock className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-on-surface-variant">
                    Stored encrypted (AES-256). Credentials are encrypted at
                    rest and never exposed in the UI, logs, or client code.
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="ember-button text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    Save credentials
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenKey(null)}
                    className="px-4 py-2 rounded-full text-sm font-medium border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Saving stores credentials securely. A portal only becomes
                  &lsquo;Connected&rsquo; after a live Test Connection
                  succeeds &mdash; it will not mark this portal connected on
                  save.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
