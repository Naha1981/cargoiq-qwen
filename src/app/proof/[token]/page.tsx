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
  { icon: 'AlertTriangle', label: 'Overcharges', count: 7, color: 'text-red-600 bg-red-50' },
  { icon: 'Clock', label: 'Demurrage', count: 3, color: 'text-amber-600 bg-amber-50' },
  { icon: 'FileSearch', label: 'Missing Docs', count: 2, color: 'text-blue-600 bg-blue-50' },
  { icon: 'CheckCircle2', label: 'Verified', count: 6, color: 'text-green-600 bg-green-50' },
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
      <div className="min-h-screen bg-[#1A2332] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Proof not found</h1>
          <p className="text-gray-400">This proof link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A2332] text-white font-sans">
      <div className="mx-auto max-w-4xl p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">CargoIQ</h1>
          <p className="text-[#B8860B] text-lg">Verified Shadow Audit Results</p>
        </div>

        <div className="bg-white rounded-2xl p-8 text-[#0D1B2A] space-y-6">
          <div className="text-center border-b border-gray-200 pb-6">
            <p className="text-sm font-medium text-gray-500 mb-2">Total Exposure Identified</p>
            <p className="font-mono text-5xl md:text-6xl font-bold text-[#DC2626]">
              R{data.exposure.toLocaleString('en-ZA')}
            </p>
            <p className="text-sm text-gray-600 mt-2">{data.shipments} shipments analysed — {data.date}</p>
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
            <h3 className="text-sm font-semibold text-[#1A2332] mb-3">Findings Detail</h3>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F1F4F8] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Shipment</th>
                    <th className="px-4 py-3">Finding</th>
                    <th className="px-4 py-3 text-right">Amount (ZAR)</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.findings.map((row: any) => (
                    <tr key={row.shipment} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{row.shipment}</td>
                      <td className="px-4 py-3">{row.finding}</td>
                      <td className="px-4 py-3 text-right font-mono">
                        {row.amount > 0 ? row.amount.toLocaleString('en-ZA') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          row.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
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

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              This proof page was generated by CargoIQ. Want to recover this exposure for your own operation?
            </p>
            <a
              href="/shadow-audit"
              className="inline-flex items-center gap-2 bg-[#B8860B] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#D4922B] transition-colors"
            >
              Run My Free Shadow Audit
            </a>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">Powered by CargoIQ — South Africa&apos;s AI-powered customs compliance platform.</p>
        </div>
      </div>
    </div>
  );
}
