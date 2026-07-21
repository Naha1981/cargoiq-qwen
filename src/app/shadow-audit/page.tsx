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
              <button className="inline-flex items-center gap-2 border border-[#B8860B] text-[#B8860B] px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[#B8860B] hover:text-white transition-colors">
                <Download className="h-4 w-4" />
                Download Savings Certificate
              </button>
            </div>
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
