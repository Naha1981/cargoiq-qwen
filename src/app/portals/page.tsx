import { Globe } from 'lucide-react';

export default function PortalsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-bold text-[#0D1B2A] font-sans mb-2">Portals</h1>
      <p className="text-sm text-[#4A5568] mb-8">Connected customs and carrier portals.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'SARS eFiling', status: 'not-connected' as const },
          { name: 'Maersk Spot', status: 'not-connected' as const },
          { name: 'DCT Durban', status: 'not-connected' as const },
          { name: 'NetSuite', status: 'not-connected' as const },
          { name: 'Sweef', status: 'not-connected' as const },
        ].map((portal, i) => (
          <div key={i} className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F1F4F8] flex items-center justify-center">
                  <Globe className="h-5 w-5 text-[#1A2332]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0D1B2A]">{portal.name}</h3>
                  <p className="text-xs text-[#4A5568]">Not connected — coming soon</p>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-gray-400" />
            </div>
            <div className="flex gap-2">
              <button className="text-xs font-medium text-gray-400 cursor-not-allowed" disabled title="Coming soon">
                Test Connection
              </button>
              <button className="text-xs font-medium text-gray-400 cursor-not-allowed" disabled title="Coming soon">
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}