'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, TrendingDown, TrendingUp, Shield } from 'lucide-react';
import jsPDF from 'jspdf';
import { cn, formatZar } from '@/lib/utils';

const mockEvents = [
  { id: 1, text: 'Demurrage waived on MSC ANITA', type: 'green' },
  { id: 2, text: 'FSC dispute raised for Maersk', type: 'amber' },
  { id: 3, text: 'New rate card uploaded: CMA CGM', type: 'blue' },
  { id: 4, text: 'Overcharge detected: R12,400', type: 'red' },
  { id: 5, text: 'Shadow audit completed', type: 'green' },
  { id: 6, text: 'Compliance pass: 97%', type: 'blue' },
];

const containersAtRisk = [
  { id: 'MSDU762391', line: 'MSC', days: 12, exposure: 42500 },
  { id: 'MSCU998234', line: 'Maersk', days: 8, exposure: 28400 },
  { id: 'HLCU112344', line: 'Hapag-Lloyd', days: 15, exposure: 52100 },
  { id: 'OOLU887612', line: 'OOCL', days: 6, exposure: 18900 },
];

const unbilledDrivers = [
  { driver: 'J. van der Merwe', location: 'Cape Town', hours: 4.5, value: 8500 },
  { driver: 'S. Nkosi', location: 'Durban', hours: 6.2, value: 12300 },
  { driver: 'P. Botha', location: 'Johannesburg', hours: 3.0, value: 5400 },
  { driver: 'R. Dlamini', location: 'Gqeberha', hours: 5.5, value: 9800 },
];

export default function SentinelPage() {
  const [events, setEvents] = useState(mockEvents);
  const [invoiceGenerating, setInvoiceGenerating] = useState<string | null>(null);
  const [activeRisk] = useState(231500);
  const [valueDelivered] = useState(1842500);

  const handleExit = useCallback(() => {
    window.location.href = '/dashboard';
  }, []);

  const generateInvoice = useCallback(async (driver: { driver: string; value: number; location: string }) => {
    setInvoiceGenerating(driver.driver);
    try {
      const tenantName = 'CargoIQ Tenant';
      const lineItems = [{ description: 'Unbilled waiting time - ' + driver.driver + ' at ' + driver.location, hours: '5.0', rate: '1,100.00', amount: driver.value }];
      const totalAmountZar = driver.value;
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const res = await fetch('/api/v1/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantName, lineItems, totalAmountZar, dueDate }),
      });
      if (!res.ok) throw new Error('Failed to create invoice');
      const data = await res.json();

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Invoice', 14, 22);
      doc.setFontSize(10);
      doc.text('Reference: ' + (data.invoice?.reference || 'N/A'), 14, 32);
      doc.text('Tenant: ' + tenantName, 14, 40);
      doc.text('Date: ' + new Date().toLocaleDateString(), 14, 48);
      doc.text('Due Date: ' + new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), 14, 56);
      doc.setFontSize(12);
      doc.text('Line Items:', 14, 70);
      doc.setFontSize(10);
      doc.text(driver.driver + ' - Unbilled waiting time at ' + driver.location + ' - R' + driver.value.toLocaleString(), 14, 80);
      doc.setFontSize(12);
      doc.text('Total: R' + driver.value.toLocaleString(), 14, 98);
      doc.save('invoice-' + (data.invoice?.reference || 'draft') + '.pdf');
    } catch (err) {
      console.error('[Invoice Generation Error]:', err);
    } finally {
      setInvoiceGenerating(null);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleExit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExit]);

  // Live event feed simulation (sample data only — not a real data stream).
  useEffect(() => {
    const interval = setInterval(() => {
      setEvents((prev) => {
        const next = [...prev];
        const types = ['green', 'amber', 'blue', 'red'] as const;
        const texts = [
          'Demurrage waived on MSC ANITA',
          'FSC dispute raised for Maersk',
          'New rate card uploaded: CMA CGM',
          'Overcharge detected: R12,400',
          'Shadow audit completed',
          'Compliance pass: 97%',
          'Invoice generated: R4,200',
          'Container released: DUR0221',
        ];
        next.push({
          id: Date.now(),
          text: texts[Math.floor(Math.random() * texts.length)],
          type: types[Math.floor(Math.random() * types.length)],
        });
        if (next.length > 8) next.shift();
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const colors: Record<string, string> = {
    green: 'bg-success/10 text-success border-success/30',
    amber: 'bg-warn/10 text-warn border-warn/30',
    blue: 'bg-tertiary/10 text-tertiary border-tertiary/30',
    red: 'bg-risk-red/10 text-risk-red border-risk-red/30',
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body-md">
      {/* Sentinel Live full-screen overlay */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-lowest/90 backdrop-blur">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full bg-risk-red animate-pulse"
          />
          <h1 className="text-lg font-semibold tracking-wide">SENTINEL LIVE</h1>
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            Sample data
          </span>
        </div>
        <button
          onClick={handleExit}
          aria-label="Exit Sentinel Live"
          className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="w-full max-w-full overflow-x-hidden p-6 space-y-6">
        {/* Honesty banner: this page is sample data only. */}
        <div
          role="status"
          className="flex items-center gap-2 rounded-md border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn"
        >
          <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-warn" />
          You're viewing sample data. Sentinel Live shows illustrative containers,
          drivers and events until live data sources are connected.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ACTIVE REVENUE AT RISK — flat risk-red */}
          <div className="flex flex-col items-center justify-center p-6 rounded-md border border-outline-variant bg-surface-container-lowest min-w-0">
            <span className="font-label-caps text-label-caps text-risk-red mb-2">
              ACTIVE REVENUE AT RISK
            </span>
            <span className="data-tabular text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-risk-red leading-tight min-w-0 overflow-hidden text-ellipsis">
              {formatZar(activeRisk)}
            </span>
            <TrendingDown className="h-6 w-6 text-risk-red mt-4" />
          </div>

          {/* VALUE DELIVERED — flat ok-green */}
          <div className="flex flex-col items-center justify-center p-6 rounded-md border border-outline-variant bg-surface-container-lowest min-w-0">
            <span className="font-label-caps text-label-caps text-success mb-2">
              VALUE DELIVERED
            </span>
            <span className="data-tabular text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-success leading-tight min-w-0 overflow-hidden text-ellipsis">
              {formatZar(valueDelivered)}
            </span>
            <TrendingUp className="h-6 w-6 text-success mt-4" />
          </div>

          {/* COMPLIANCE PASS RATE — donut in ember gradient */}
          <div className="flex flex-col items-center justify-center p-6 rounded-md border border-outline-variant bg-surface-container-lowest min-w-0">
            <span className="font-label-caps text-label-caps text-on-surface-variant mb-4">
              COMPLIANCE PASS RATE
            </span>
            <div className="relative w-40 h-40">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <defs>
                  <linearGradient id="sentinel-donut" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7e2410" />
                    <stop offset="50%" stopColor="#c83a12" />
                    <stop offset="100%" stopColor="#f2451c" />
                  </linearGradient>
                </defs>
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E4E7EC"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#sentinel-donut)"
                  strokeWidth="3"
                  strokeDasharray="97, 100"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="data-tabular text-3xl font-bold text-on-surface">97%</span>
              </div>
            </div>
            <Shield className="h-6 w-6 text-primary mt-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Containers at Risk — no-horizontal-scroll table fix preserved */}
          <div className="rounded-md border border-outline-variant bg-surface-container-lowest p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-on-surface-variant">Containers at Risk</h2>
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                Sample data
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[560px] w-full table-fixed text-sm">
                <colgroup>
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '35%' }} />
                </colgroup>
                <thead>
                  <tr className="text-left text-outline-variant border-b border-outline-variant">
                    <th className="pb-2 font-medium">Container</th>
                    <th className="pb-2 font-medium">Line</th>
                    <th className="pb-2 font-medium">Days Past Free</th>
                    <th className="pb-2 font-medium text-right">Exposure R</th>
                  </tr>
                </thead>
                <tbody>
                  {containersAtRisk.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        'border-b border-outline-variant/50',
                        row.exposure > 40000 ? 'bg-risk-red/10' : ''
                      )}
                    >
                      <td className="py-3 data-tabular text-xs truncate" title={row.id}>{row.id}</td>
                      <td className="py-3 text-on-surface">{row.line}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center rounded-full bg-risk-red/15 px-2 py-0.5 text-xs font-medium text-risk-red">
                          {row.days}d
                        </span>
                      </td>
                      <td className="py-3 text-right data-tabular text-xs text-on-surface">
                        {formatZar(row.exposure)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unbilled Waiting Time — per-row ember-gradient Generate Invoice */}
          <div className="rounded-md border border-outline-variant bg-surface-container-lowest p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-on-surface-variant">Unbilled Waiting Time</h2>
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                Sample data
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[560px] w-full table-fixed text-sm">
                <colgroup>
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <thead>
                  <tr className="text-left text-outline-variant border-b border-outline-variant">
                    <th className="pb-2 font-medium">Driver</th>
                    <th className="pb-2 font-medium">Location</th>
                    <th className="pb-2 font-medium">Hours</th>
                    <th className="pb-2 font-medium text-right">Value R</th>
                    <th className="pb-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unbilledDrivers.map((row) => (
                    <tr key={row.driver} className="border-b border-outline-variant/50">
                      <td className="py-3 truncate text-on-surface" title={row.driver}>{row.driver}</td>
                      <td className="py-3 text-on-surface-variant">{row.location}</td>
                      <td className="py-3 text-on-surface">{row.hours.toFixed(1)}</td>
                      <td className="py-3 text-right data-tabular text-xs text-on-surface">
                        {formatZar(row.value)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => generateInvoice(row)}
                          className="ember-button rounded-md px-3 py-1 text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
                          disabled={invoiceGenerating === row.driver}
                        >
                          {invoiceGenerating === row.driver ? 'Generating...' : 'Generate Invoice'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live Event Feed */}
        <div className="rounded-md border border-outline-variant bg-surface-container-lowest p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-on-surface-variant">Live Event Feed</h2>
            <span className="font-label-caps text-label-caps text-on-surface-variant">
              Sample data
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {events.map((event) => (
              <span
                key={event.id}
                className={cn(
                  'whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-all',
                  colors[event.type]
                )}
              >
                {event.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
