'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Upload, Share2, Download, ChevronRight, AlertTriangle, CheckCircle2, Clock, FileSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

const findings = [
  { icon: AlertTriangle, label: 'Overcharges', count: 7, color: 'text-error bg-error-container/20' },
  { icon: Clock, label: 'Demurrage', count: 3, color: 'text-primary-container bg-primary-container/10' },
  { icon: FileSearch, label: 'Missing Docs', count: 2, color: 'text-tertiary bg-tertiary/10' },
  { icon: CheckCircle2, label: 'Verified', count: 6, color: 'text-success bg-success/10' },
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

  const handleDownloadCertificate = async () => {
    setDownloadMsg('');
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new (jsPDF as any)({ unit: 'pt', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();
      const today = new Date().toISOString().slice(0, 10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('CargoIQ — Savings Certificate', W / 2, 50, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(200, 30, 30);
      doc.text('SAMPLE / DEMO CERTIFICATE', W / 2, 72, { align: 'center' });
      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Company: Your operation', W / 2, 92, { align: 'center' });
      doc.text('Audit Date: ' + today, W / 2, 108, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(20, 20, 20);
      doc.text('Total Exposure Identified', 48, 150);
      doc.setFontSize(22);
      doc.setTextColor(200, 30, 30);
      doc.text('R' + Number(currentExposure).toLocaleString('en-ZA').replace(/,/g, ' '), 48, 178);
      doc.setTextColor(20, 20, 20);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Category Tallies', 48, 212);
      autoTable(doc, {
        startY: 222,
        head: [['Category', 'Count']],
        body: findings.map(t => [String(t.label), String(t.count)]),
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [26, 35, 50] },
        columnStyles: { 0: { cellWidth: 120 } },
        margin: { left: 48, right: 48 },
      });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      const fy = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 24 : 320;
      doc.text('Findings Detail', 48, fy);
      autoTable(doc, {
        startY: fy + 8,
        head: [['Shipment', 'Finding', 'Amount (ZAR)', 'Status']],
        body: currentFindings.map(f => [String(f.shipment), String(f.finding), 'R' + Number(f.amount).toLocaleString('en-ZA').replace(/,/g, ' '), String(f.status)]),
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [26, 35, 50] },
        columnStyles: { 1: { cellWidth: 'auto' }, 2: { halign: 'right', cellWidth: 80 }, 3: { cellWidth: 50 } },
        margin: { left: 48, right: 48 },
      });
      const footY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 24 : 720;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('Generated by CargoIQ — South Africa\'s AI-powered customs compliance platform.', W / 2, footY, { align: 'center' });
      doc.text('This is a sample certificate from a demo audit; run a Shadow Audit on your own documents for your verified certificate.', W / 2, footY + 12, { align: 'center' });
      doc.save('CargoIQ-Savings-Certificate-' + today + '.pdf');
    } catch (e) {
      console.error(e);
      setDownloadMsg('Couldn\'t generate the PDF just now — please try again.');
    }
  };

  const currentFindings = showDemo ? demoFindingsDetail : findingsDetail;
  const currentExposure = showDemo ? demoExposure : 94500;

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body-md">
      <div className="mx-auto max-w-6xl p-margin-page space-y-gutter">
        <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase industrial-tracking">Shadow Audit</h1>

        {!isRunning && progress < 100 && !showDemo && (
          <div className="bg-surface border border-outline-variant p-6">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Run Shadow Audit</h2>
            <div className="rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center cursor-pointer hover:border-primary-container transition-colors relative">
              <input
                type="file"
                accept=".pdf"
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setFiles(e.target.files)}
              />
              <Upload className="mx-auto h-10 w-10 text-on-surface-variant mb-3" />
              <p className="font-body-md text-on-surface-variant mb-1">Click to upload PDF invoices</p>
              <p className="font-label-caps text-label-caps text-on-surface-variant">Multiple files accepted</p>
              {files && files.length > 0 && (
                <p className="font-label-caps text-label-caps text-primary-container mt-2 font-bold">{files.length} file(s) selected</p>
              )}
            </div>

            <div className="mt-4">
              <button
                onClick={handleDemoAudit}
                className="inline-flex items-center gap-2 border border-primary-container text-primary-container px-6 py-2.5 rounded text-sm font-medium hover:bg-primary-container hover:text-on-primary-container transition-colors"
              >
                ▶ Run Demo Audit (sample data — no upload needed)
              </button>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-on-surface-variant hover:text-on-surface">
                Optional Settings
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-gutter">
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Carrier Filter</label>
                  <select className="w-full rounded border border-outline-variant px-3 py-2 text-sm bg-surface-container-lowest text-on-surface">
                    <option>All carriers</option>
                    <option>Maersk</option>
                    <option>MSC</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Date Range</label>
                  <select className="w-full rounded border border-outline-variant px-3 py-2 text-sm bg-surface-container-lowest text-on-surface">
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
                className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Run Shadow Audit
              </button>
            </div>
          </div>
        )}

        {isRunning && (
          <div className="bg-surface border border-outline-variant p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-body-md text-on-surface">Analysing {totalShipments} shipments...</span>
              <span className="font-data-tabular text-on-surface-variant">{completed} complete</span>
            </div>
            <div className="h-3 w-full rounded-full bg-surface-container-highest overflow-hidden">
              <div
                className="h-full rounded bg-primary-container transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="font-data-tabular text-[10px] text-on-surface-variant mt-2">{progress}% processed</p>
          </div>
        )}

        {(showDemo || (!isRunning && progress === 100)) && (
          <div className="bg-surface border border-outline-variant p-6 space-y-gutter">
            <div className="rounded border-l-4 border-error bg-error-container/20 p-4">
              <p className="font-body-md text-error">R{currentExposure.toLocaleString('en-ZA')} in exposure identified across {showDemo ? 6 : totalShipments} shipments</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
              {findings.map((item) => (
                <div key={item.label} className={cn('rounded-lg p-4 flex items-center gap-3', item.color)}>
                  <item.icon className="h-5 w-5" />
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant opacity-80">{item.label}</p>
                    <p className="font-data-tabular text-xl font-bold text-on-surface">{item.count}</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-3">Findings Detail</h3>
              <div className="rounded-lg border border-outline-variant overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container-lowest text-left font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                      <th className="px-4 py-3">Shipment</th>
                      <th className="px-4 py-3">Finding</th>
                      <th className="px-4 py-3 text-right">Amount (ZAR)</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {currentFindings.map((row) => (
                      <tr key={row.shipment} className="hover:bg-surface-container-highest transition-colors">
                        <td className="px-4 py-3 font-data-tabular text-xs">{row.shipment}</td>
                        <td className="px-4 py-3 text-body-md">{row.finding}</td>
                        <td className="px-4 py-3 text-right font-data-tabular mono">
                          {row.amount > 0 ? 'R' + row.amount.toLocaleString('en-ZA').replace(/,/g, ' ') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold uppercase',
                            row.status === 'open'
                              ? 'bg-error-container/20 border border-error/30 text-error'
                              : 'bg-tertiary/10 border border-tertiary/30 text-tertiary'
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

            <div className="flex flex-wrap gap-gutter">
              <button
                onClick={() => handleCopyProof(showDemo ? 'demo' : 'live')}
                className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2.5 rounded text-sm font-medium hover:opacity-90 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                {copied ? 'Copied!' : 'Copy proof-page link'}
              </button>
              <button
                onClick={handleDownloadCertificate}
                className="inline-flex items-center gap-2 border border-primary-container text-primary-container px-4 py-2.5 rounded text-sm font-medium hover:bg-primary-container hover:text-on-primary-container transition-colors"
              >
                <Download className="h-4 w-4" />
                Download Savings Certificate
              </button>
            </div>
            {downloadMsg && (
              <p className="font-label-caps text-label-caps text-error text-xs mt-2">{downloadMsg}</p>
            )}
          </div>
        )}

        <div className="bg-surface border border-outline-variant divide-y divide-outline-variant">
          <h3 className="font-label-caps text-label-caps text-on-surface px-6 py-4 uppercase tracking-wider">Previous Audits</h3>
          {previousAudits.map((audit) => (
            <Link
              key={audit.id}
              href={`/shadow-audit/${audit.id}`}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-container-highest transition-colors"
            >
              <div>
                <p className="font-data-tabular text-on-surface text-sm">{audit.date}</p>
                <p className="font-label-caps text-label-caps text-on-surface-variant text-xs">{audit.shipments} shipments · R{audit.exposure.toLocaleString('en-ZA')} exposure</p>
              </div>
              <ChevronRight className="h-4 w-4 text-on-surface-variant" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}