'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Upload, Share2, Download, ChevronRight, AlertTriangle, CheckCircle2, Clock, FileSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

const findings = [
  { icon: AlertTriangle, label: 'Overcharges', count: 7, color: 'text-red-600 bg-red-50' },
  { icon: Clock, label: 'Demurrage', count: 3, color: 'text-amber-600 bg-amber-50' },
  { icon: FileSearch, label: 'Missing Docs', count: 2, color: 'text-blue-600 bg-blue-50' },
  { icon: CheckCircle2, label: 'Verified', count: 6, color: 'text-green-600 bg-green-50' },
];

const findingsDetail = [
  { shipment: 'SHIP-001', finding: 'Overcharge on Ocean Freight', amount: 12500, status: 'open' },
  { shipment: 'SHIP-002', finding: 'Demurrage period disputed', amount: 8400, status: 'open' },
  { shipment: 'SHIP-003', finding: 'Missing cargo manifest', amount: 0, status: 'info' },
  { shipment: 'SHIP-004', finding: 'FSC variance detected', amount: 23100, status: 'open' },
  { shipment: 'SHIP-005', finding: 'Rate card expired', amount: 0, status: 'info' },
];

const demoFindingsDetail = [
  { shipment: 'SHIP-D01', finding: '6-digit HS code used — potential misclassification', amount: 18500, status: 'open' },
  { shipment: 'SHIP-D02', finding: 'Invoice qty (500) vs packing list (480) — 20 units overbilled', amount: 22000, status: 'open' },
  { shipment: 'SHIP-D03', finding: 'Non-SACU origin; 10% VAT uplift not applied', amount: 12800, status: 'open' },
  { shipment: 'SHIP-D04', finding: 'Foreign-registered truck with no TMS number on file', amount: 9500, status: 'open' },
  { shipment: 'SHIP-D05', finding: 'Sugar product missing HPL documentation', amount: 14200, status: 'open' },
  { shipment: 'SHIP-D06', finding: 'Temporary export with no DA65 stamp', amount: 11400, status: 'open' },
];

const previousAudits = [
  { id: 1, date: '2025-06-15', shipments: 24, exposure: 142000 },
  { id: 2, date: '2025-05-28', shipments: 18, exposure: 98500 },
  { id: 3, date: '2025-05-10', shipments: 31, exposure: 210000 },
];

export default function ShadowAuditPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [files, setFiles] = useState<FileList | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const totalShipments = 18;
  const demoExposure = demoFindingsDetail.reduce((sum, f) => sum + f.amount, 0);

  const handleRunAudit = () => {
    if (!files || files.length === 0) return;
    setIsRunning(true);
    setProgress(0);
    setCompleted(0);
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.floor(Math.random() * 15) + 5;
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
      }
      const comp = Math.floor((prog / 100) * totalShipments);
      setProgress(prog);
      setCompleted(comp);
      if (prog === 100) setIsRunning(false);
    }, 600);
  };

  const handleDemoAudit = () => {
    setShowDemo(true);
    setProgress(100);
  };

  const handleCopyProof = (token: string) => {
    const url = `${window.location.origin}/proof/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadCertificate = () => {
    try {
      setDownloadMsg(null);
      const today = new Date().toISOString().slice(0, 10);
      const rows = currentFindings.map((f) => `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-family:monospace;font-size:13px;">${f.shipment}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px;">${f.finding}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace;font-size:13px;">${f.amount > 0 ? 'R' + f.amount.toLocaleString('en-ZA') : '—'}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px;">${f.status === 'open' ? 'Open' : 'Info'}</td></tr>`).join('');
      const cardRows = findings.map((c) => `<div style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:8px;background:${c.color.includes('red') ? '#fef2f2' : c.color.includes('amber') ? '#fffbeb' : c.color.includes('blue') ? '#eff6ff' : '#f0fdf4'};"><span style="font-size:18px;">${c.icon}</span><div><div style="font-size:12px;color:#64748b;">${c.label}</div><div style="font-size:20px;font-weight:bold;">${c.count}</div></div></div>`).join('');
      const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>CargoIQ — Savings Certificate</title><style>@media print{body{margin:0;padding:20px;font-family:sans-serif;color:#0d1b2a;background:#fff}@media print{.no-print{display:none!important}}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:800px;margin:0 auto;padding:40px;background:#f1f4f8;color:#0d1b2a}h1{font-size:24px;font-weight:700;margin-bottom:4px}h2{font-size:18px;font-weight:600;margin:24px 0 12px}h3{font-size:14px;font-weight:600;margin:16px 0 8px;color:#64748b}.badge{display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600}.badge-red{background:#fef2f2;color:#dc2626}.badge-amber{background:#fffbeb;color:#d97706}.badge-blue{background:#eff6ff;color:#2563eb}.badge-green{background:#f0fdf4;color:#16a34a}.card{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:16px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}@media(max-width:640px){.grid{grid-template-columns:repeat(2,1fr)}}table{width:100%;border-collapse:collapse;font-size:13px}.btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;border:none}.btn-print{background:#b8860b;color:#fff}.btn-print:hover{background:#9a7209}.text-center{text-align:center}.mt-2{margin-top:8px}.text-sm{font-size:14px}.text-xs{font-size:12px}.text-red-700{color:#b91c1c}.text-amber-700{color:#b45309}.text-blue-700{color:#1d4ed8}.text-green-700{color:#15803d}.bg-red-50{background:#fef2f2;border:1px solid #fecaca}.bg-amber-50{background:#fffbeb;border:1px solid #fde68a}.bg-blue-50{background:#eff6ff;border:1px solid #bfdbfe}.bg-green-50{background:#f0fdf4;border:1px solid #bbf7d0}.rounded-lg{border-radius:8px}.p-4{padding:16px}.mb-4{margin-bottom:16px}.flex{display:flex}.flex-wrap{flex-wrap:wrap}.items-center{align-items:center}.gap-2{gap:8px}.gap-3{gap:12px}.justify-between{justify-content:space-between}.w-full{width:100%}.text-right{text-align:right}.font-mono{font-family:monospace}.font-bold{font-weight:700}.font-semibold{font-weight:600}.font-medium{font-weight:500}.opacity-80{opacity:.80}.text-gray-500{color:#6b7280}.text-gray-600{color:#4b5563}.text-gray-400{color:#9ca3af}.text-[#1a2332]{color:#1a2332}.text-[#b8860b]{color:#b8860b}.bg-[#b8860b]{background-color:#b8860b}.bg-[#b8860b]\\/20{background-color:rgba(184,134,11,.2)}.border{border:1px solid #e2e8f0}.border-t{border-top:1px solid #e2e8f0}.divide-y>div{border-bottom:1px solid #e2e8f0}.hover\\:bg-gray-50:hover{background:#f9fafb}.transition-colors{transition:color .15s}.text-xs{font-size:12px}.text-sm{font-size:14px}.text-lg{font-size:18px}.text-2xl{font-size:24px}.text-3xl{font-size:30px}.leading-tight{line-height:1.25}.tracking-wider{letter-spacing:.05em}.uppercase{text-transform:uppercase}.inline-flex{display:inline-flex}.rounded-full{border-radius:9999px}.px-2{padding-left:8px;padding-right:8px}.py-0\\.5{padding-top:2px;padding-bottom:2px}.ml-auto{margin-left:auto}.h-4{height:1rem}.h-5{height:1.25rem}.h-10{height:2.5rem}.w-4{width:1rem}.w-5{width:1.25rem}.w-10{width:2.5rem}.shrink-0{flex-shrink:0}.flex-1{flex:1}.truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.space-y-6>*+*{margin-top:24px}.space-y-4>*+*{margin-top:16px}.space-y-5>*+*{margin-top:20px}.mb-2{margin-bottom:8px}.mb-3{margin-bottom:12px}.mb-6{margin-bottom:24px}.mt-1{margin-top:4px}.mt-2{margin-top:8px}.mt-3{margin-top:12px}.mt-4{margin-top:16px}.mt-6{margin-top:24px}.pt-4{padding-top:16px}.pb-4{padding-bottom:16px}.px-3{padding-left:12px;padding-right:12px}.px-4{padding-left:16px;padding-right:16px}.py-2\\.5{padding-top:10px;padding-bottom:10px}.py-3{padding-top:12px;padding-bottom:12px}.bg-white{background:#fff}.bg-[#f1f4f8]{background:#f1f4f8}.bg-red-50{background:#fef2f2}.border-red-100{border-color:#fecaca}.text-red-700{color:#b91c1c}.text-red-600{color:#dc2626}.bg-amber-50{background:#fffbeb}.text-amber-600{color:#d97706}.bg-blue-50{background:#eff6ff}.text-blue-600{color:#2563eb}.bg-green-50{background:#f0fdf4}.text-green-600{color:#16a34a}.text-gray-400{color:#9ca3af}.text-gray-600{color:#4b5563}.text-gray-700{color:#374151}.text-[#94a3b8]{color:#94a3b8}.hover\\:text-white:hover{color:#fff}.hover\\:bg-\\[\\#9a7209\\]:hover{background:#9a7209}.disabled\\:opacity-50:disabled{opacity:.50}.disabled\\:cursor-not-allowed:disabled{cursor:not-allowed}</style></head><body><div class="no-print" style="display:flex;justify-content:flex-end;margin-bottom:16px;"><button onclick="window.print()" class="btn btn-print">Print / Save as PDF</button></div><div class="card" style="text-align:center;border:2px solid #b8860b;"><h1 style="font-size:28px;font-weight:700;color:#1a2332;">CargoIQ — Savings Certificate</h1><p style="font-size:14px;font-weight:600;color:#dc2626;margin-top:8px;">SAMPLE / DEMO CERTIFICATE</p><p style="font-size:14px;color:#64748b;margin-top:4px;">Company: Your operation</p><p style="font-size:14px;color:#64748b;">Audit Date: ${today}</p></div><div class="card"><h2>Total Exposure Identified</h2><p style="font-size:24px;font-weight:700;color:#dc2626;">R${currentExposure.toLocaleString('en-ZA')}</p></div><div class="card"><h3>Category Tallies</h3><div class="grid">${cardRows}</div></div><div class="card"><h3>Findings Detail</h3><table><thead><tr style="background:#f1f4f8;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;"><th style="padding:8px;">Shipment</th><th style="padding:8px;">Finding</th><th style="padding:8px;text-align:right;">Amount (ZAR)</th><th style="padding:8px;">Status</th></tr></thead><tbody>${rows}</tbody></table></div><div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#9ca3af;text-align:center;">Generated by CargoIQ — South Africa's AI-powered customs compliance platform. This is a sample certificate from a demo audit; run a Shadow Audit on your own documents for your verified certificate.</div></body></html>`;
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CargoIQ-Savings-Certificate-${today}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadMsg("Couldn't generate the certificate just now — please try again.");
    }
  };

  const currentFindings = showDemo ? demoFindingsDetail : findingsDetail;
  const currentExposure = showDemo ? demoExposure : 94500;

  return (
    <div className="min-h-screen bg-[#F1F4F8] text-[#0D1B2A] font-sans">
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        <h1 className="text-3xl font-bold text-[#1A2332]">Shadow Audit</h1>

        {!isRunning && progress < 100 && !showDemo && (
          <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
            <h2 className="text-lg font-semibold text-[#1A2332] mb-4">Run Shadow Audit</h2>
            <div className="rounded-lg border-2 border-dashed border-[#E2E8F0] bg-[#F1F4F8] p-8 text-center cursor-pointer hover:border-[#B8860B] transition-colors relative">
              <input
                type="file"
                accept=".pdf"
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setFiles(e.target.files)}
              />
              <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-1">Click to upload PDF invoices</p>
              <p className="text-xs text-gray-400">Multiple files accepted</p>
              {files && files.length > 0 && (
                <p className="text-sm text-[#B8860B] mt-2 font-medium">{files.length} file(s) selected</p>
              )}
            </div>

            <div className="mt-4">
              <button
                onClick={handleDemoAudit}
                className="inline-flex items-center gap-2 border border-[#B8860B] text-[#B8860B] px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#B8860B] hover:text-white transition-colors"
              >
                ▶ Run Demo Audit (sample data — no upload needed)
              </button>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-[#1A2332]">
                Optional Settings
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Carrier Filter</label>
                  <select className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm bg-white">
                    <option>All carriers</option>
                    <option>Maersk</option>
                    <option>MSC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label>
                  <select className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm bg-white">
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>
              </div>
            </details>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleRunAudit}
                disabled={!files || files.length === 0}
                className="bg-[#B8860B] text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#9a7209] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Run Shadow Audit
              </button>
            </div>
          </div>
        )}

        {isRunning && (
          <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Analysing {totalShipments} shipments...</span>
              <span className="text-sm text-gray-500">{completed} complete</span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#B8860B] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{progress}% processed</p>
          </div>
        )}

        {(showDemo || (!isRunning && progress === 100)) && (
          <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 space-y-6">
            <div className="rounded-lg bg-red-50 border border-red-100 p-4">
              <p className="text-sm font-medium text-red-700">R{currentExposure.toLocaleString('en-ZA')} in exposure identified across {showDemo ? 6 : totalShipments} shipments</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {findings.map((item) => (
                <div key={item.label} className={cn('rounded-lg p-4 flex items-center gap-3', item.color)}>
                  <item.icon className="h-5 w-5" />
                  <div>
                    <p className="text-xs font-medium opacity-80">{item.label}</p>
                    <p className="text-xl font-bold">{item.count}</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#1A2332] mb-3">Findings Detail</h3>
              <div className="rounded-lg border border-[#E2E8F0] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F1F4F8] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Shipment</th>
                      <th className="px-4 py-3">Finding</th>
                      <th className="px-4 py-3 text-right">Amount (ZAR)</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {currentFindings.map((row) => (
                      <tr key={row.shipment} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{row.shipment}</td>
                        <td className="px-4 py-3">{row.finding}</td>
                        <td className="px-4 py-3 text-right font-mono">
                          {row.amount > 0 ? row.amount.toLocaleString('en-ZA') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            row.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          )}>
                            {row.status === 'open' ? 'Open' : 'Info'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleCopyProof(showDemo ? 'demo' : 'live')}
                className="inline-flex items-center gap-2 bg-[#B8860B] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[#9a7209] transition-colors"
              >
                <Share2 className="h-4 w-4" />
                {copied ? 'Copied!' : 'Copy proof-page link'}
              </button>
              <button
                onClick={handleDownloadCertificate}
                className="inline-flex items-center gap-2 border border-[#B8860B] text-[#B8860B] px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[#B8860B] hover:text-white transition-colors"
              >
                <Download className="h-4 w-4" />
                Download Savings Certificate
              </button>
            </div>
            {downloadMsg && (
              <p className="text-xs text-red-600 mt-2">{downloadMsg}</p>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg border border-[#E2E8F0] divide-y divide-[#E2E8F0]">
          <h3 className="px-6 py-4 text-lg font-semibold text-[#1A2332]">Previous Audits</h3>
          {previousAudits.map((audit) => (
            <Link
              key={audit.id}
              href={`/shadow-audit/${audit.id}`}
              className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-[#1A2332]">{audit.date}</p>
                <p className="text-xs text-gray-500">{audit.shipments} shipments · R{audit.exposure.toLocaleString('en-ZA')} exposure</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
