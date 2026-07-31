import { previousAudits, auditFindings } from '@/lib/auditData';
import { AlertTriangle, Clock, FileSearch, CheckCircle2 } from 'lucide-react';

const demoExposure = 88400;
const demoFindings = [
  { shipment: 'SHIP-D01', finding: '6-digit HS code used — potential misclassification', amount: 18500, status: 'open' },
  { shipment: 'SHIP-D02', finding: 'Invoice qty (500) vs packing list (480) — 20 units overbilled', amount: 22000, status: 'open' },
  { shipment: 'SHIP-D03', finding: 'Non-SACU origin; 10% VAT uplift not applied', amount: 12800, status: 'open' },
  { shipment: 'SHIP-D04', finding: 'Foreign-registered truck with no TMS number on file', amount: 9500, status: 'open' },
  { shipment: 'SHIP-D05', finding: 'Sugar product missing HPL documentation', amount: 14200, status: 'open' },
  { shipment: 'SHIP-D06', finding: 'Temporary export with no DA65 stamp', amount: 11400, status: 'open' },
];

const categories = [
  { icon: 'AlertTriangle', label: 'Overcharges', count: 7, color: 'text-risk-red bg-risk-red/10' },
  { icon: 'Clock', label: 'Demurrage', count: 3, color: 'text-warn bg-warn/10' },
  { icon: 'FileSearch', label: 'Missing Docs', count: 2, color: 'text-tertiary bg-tertiary/10' },
  { icon: 'CheckCircle2', label: 'Verified', count: 6, color: 'text-success bg-success/10' },
];

function getAuditData(token: string) {
  if (token === 'demo') {
    return {
      date: 'Demo Audit',
      shipments: 6,
      exposure: demoExposure,
      findings: demoFindings,
    };
  }
  const id = parseInt(token, 10);
  const audit = previousAudits.find((a) => a.id === id);
  if (!audit) return null;
  return {
    date: audit.date,
    shipments: audit.shipments,
    exposure: audit.exposure,
    findings: auditFindings[id] || [],
  };
}

export default async function PublicProofPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = getAuditData(token);

  if (!data) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-on-surface mb-4">Proof not found</h1>
          <p className="text-on-surface-variant">This proof link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const isDemo = token === 'demo';

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body-md">
      <div className="mx-auto max-w-4xl p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-on-surface mb-2">
            Cargo<span className="iq-gradient">IQ</span>
          </h1>
          <p className="text-lg ember-text font-semibold">Verified Shadow Audit Results</p>
        </div>

        {/* Honesty: tag demo/sample proof so it is never mistaken for a live audit */}
        {isDemo && (
          <div className="mx-auto max-w-2xl rounded border-l-4 border-warn bg-warn/10 p-3 text-sm text-warn">
            You're viewing a <strong>Demo Audit</strong> with illustrative sample data — not findings from a real shipment set.
          </div>
        )}

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm p-8 space-y-6">
          <div className="text-center border-b border-outline-variant pb-6">
            <p className="text-sm font-medium text-on-surface-variant mb-2">Total Exposure Identified</p>
            <p className="font-mono text-5xl md:text-6xl font-bold text-risk-red">
              R{data.exposure.toLocaleString('en-ZA')}
            </p>
            <p className="text-sm text-on-surface-variant mt-2">{data.shipments} shipments analysed — {data.date}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((item) => (
              <div key={item.label} className={`rounded-lg p-4 flex items-center gap-3 ${item.color}`}>
                {item.label === 'Overcharges' && <AlertTriangle className="h-5 w-5" />}
                {item.label === 'Demurrage' && <Clock className="h-5 w-5" />}
                {item.label === 'Missing Docs' && <FileSearch className="h-5 w-5" />}
                {item.label === 'Verified' && <CheckCircle2 className="h-5 w-5" />}
                <div>
                  <p className="text-xs font-medium opacity-80">{item.label}</p>
                  <p className="text-xl font-bold">{item.count}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-on-surface mb-3">Findings Detail</h3>
            <div className="rounded-lg border border-outline-variant overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container-low text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    <th className="px-4 py-3">Shipment</th>
                    <th className="px-4 py-3">Finding</th>
                    <th className="px-4 py-3 text-right">Amount (ZAR)</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {data.findings.map((row: any) => (
                    <tr key={row.shipment} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{row.shipment}</td>
                      <td className="px-4 py-3">{row.finding}</td>
                      <td className="px-4 py-3 text-right font-mono">
                        {row.amount > 0 ? row.amount.toLocaleString('en-ZA') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          row.status === 'open' ? 'bg-risk-red/10 text-risk-red' : 'bg-tertiary/10 text-tertiary'
                        }`}>
                          {row.status === 'open' ? 'Open' : 'Info'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-outline-variant">
            <p className="text-sm text-on-surface-variant mb-4">
              This proof page was generated by CargoIQ. Want to recover this exposure for your own operation?
            </p>
            <a
              href="/shadow-audit"
              className="ember-button inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-opacity"
            >
              Run My Free Shadow Audit
            </a>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-on-surface-variant">Powered by CargoIQ — South Africa&apos;s AI-powered customs compliance platform.</p>
        </div>
      </div>
    </div>
  );
}
