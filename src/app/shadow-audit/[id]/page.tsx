'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Share2, Download, ChevronLeft, AlertTriangle, CheckCircle2, Clock, FileSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

import { previousAudits, auditFindings } from '@/lib/auditData';

const categories = [
  { icon: AlertTriangle, label: 'Overcharges', count: 7, color: 'text-red-600 bg-red-50' },
  { icon: Clock, label: 'Demurrage', count: 3, color: 'text-amber-600 bg-amber-50' },
  { icon: FileSearch, label: 'Missing Docs', count: 2, color: 'text-blue-600 bg-blue-50' },
  { icon: CheckCircle2, label: 'Verified', count: 6, color: 'text-green-600 bg-green-50' },
];

export default function ShadowAuditDetailPage() {
  const params = useParams();
  const auditId = parseInt(params.id as string, 10);
  const [copied, setCopied] = useState(false);

  const audit = previousAudits.find((a) => a.id === auditId);
  const findings = auditFindings[auditId] || [];
  const totalExposure = findings.reduce((sum, f) => sum + f.amount, 0);

  if (!audit) {
    return (
      <div className="min-h-screen bg-[#F1F4F8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Audit not found.</p>
          <Link href="/shadow-audit" className="text-[#B8860B] hover:underline">Back to Shadow Audit</Link>
        </div>
      </div>
    );
  }

  const handleCopyProof = () => {
    const url = `${window.location.origin}/proof/${auditId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#F1F4F8] text-[#0D1B2A] font-sans">
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        <Link href="/shadow-audit" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#1A2332] mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to Shadow Audit
        </Link>

        <h1 className="text-3xl font-bold text-[#1A2332]">
          Audit Detail — {audit.date}
        </h1>

        <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 space-y-6">
          <div className="rounded-lg bg-red-50 border border-red-100 p-4">
            <p className="text-sm font-medium text-red-700">R{totalExposure.toLocaleString('en-ZA')} in exposure identified across {audit.shipments} shipments</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((item) => (
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
                  {findings.map((row) => (
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
              onClick={handleCopyProof}
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
      </div>
    </div>
  );
}
