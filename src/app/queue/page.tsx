'use client';

import { useState } from 'react';

interface ComplianceResult {
  module: string;
  moduleName: string;
  status: 'pass' | 'warn' | 'hold';
  message: string;
  exposureZar: number;
}

interface CheckResponse {
  success: boolean;
  data: {
    overallStatus: 'pass' | 'warn' | 'hold';
    totalExposureZar: number;
    results: ComplianceResult[];
    meta: { modulesRun: number; durationMs: number; holds: number; warnings: number; passes: number };
  };
}

export default function QueuePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [testDoc, setTestDoc] = useState({
    invoiceNumber: 'INV-2026-001',
    invoiceItems: [
      { description: 'Steel coils', quantity: 500, unitPrice: 1000, totalValue: 500000, hsCode: '7208.10.00' },
    ],
    packingListItems: [
      { description: 'Steel coils', quantity: 480, weight: 24000 },
    ],
    invoiceTotal: 500000,
    originCountry: 'CN',
    customsValueZar: 500000,
    hsCode: '7208.10.00',
    cargoDescription: 'Hot-rolled steel coils',
    isTemporaryExport: false,
    containsSugar: false,
    isCrossBorderRoad: false,
    isForeignRegistered: false,
    importerCode: 'ZA1234567890',
  });

  async function runCheck() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/v1/compliance/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testDoc),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Check failed');
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Network error. Is the dev server running?');
    } finally {
      setLoading(false);
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-700 bg-green-50 border-green-200';
      case 'warn': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'hold': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const statusDot = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-600';
      case 'warn': return 'bg-amber-500';
      case 'hold': return 'bg-red-600';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A2332]">Compliance Shield</h1>
        <p className="text-sm text-gray-500 mt-1">
          7-module pre-clearance checker · Zero AI cost · Pure TypeScript · &lt;3 seconds
        </p>
      </div>

      <div className="bg-white rounded-lg border p-4 mb-6">
        <h2 className="text-sm font-semibold text-[#1A2332] mb-3">Test Document</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <label className="text-xs text-gray-500">HS Code</label>
            <input
              className="w-full border rounded px-2 py-1 font-mono"
              value={testDoc.hsCode}
              onChange={(e) => setTestDoc({ ...testDoc, hsCode: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Origin Country</label>
            <input
              className="w-full border rounded px-2 py-1 font-mono"
              value={testDoc.originCountry}
              onChange={(e) => setTestDoc({ ...testDoc, originCountry: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Customs Value (ZAR)</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1 font-mono"
              value={testDoc.customsValueZar}
              onChange={(e) => setTestDoc({ ...testDoc, customsValueZar: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Importer Code</label>
            <input
              className="w-full border rounded px-2 py-1 font-mono"
              value={testDoc.importerCode}
              onChange={(e) => setTestDoc({ ...testDoc, importerCode: e.target.value })}
            />
          </div>
          <div className="col-span-2 flex gap-4 mt-2">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={testDoc.isCrossBorderRoad}
                onChange={(e) => setTestDoc({ ...testDoc, isCrossBorderRoad: e.target.checked })}
              />
              Cross-border road
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={testDoc.isForeignRegistered}
                onChange={(e) => setTestDoc({ ...testDoc, isForeignRegistered: e.target.checked })}
              />
              Foreign vehicle
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={testDoc.isTemporaryExport}
                onChange={(e) => setTestDoc({ ...testDoc, isTemporaryExport: e.target.checked })}
              />
              Temporary export
            </label>
          </div>
        </div>
        <button
          onClick={runCheck}
          disabled={loading}
          className="mt-4 bg-[#B8860B] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#9a7209] disabled:opacity-50"
        >
          {loading ? 'Running 7 modules...' : 'Run Compliance Shield'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-600">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className={`rounded-lg border p-4 ${statusColor(result.data.overallStatus)}`}>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold uppercase text-sm">{result.data.overallStatus}</span>
                <span className="ml-3 text-sm">
                  {result.data.meta.passes} pass · {result.data.meta.warnings} warn · {result.data.meta.holds} hold
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-70">Total Exposure</div>
                <div className="font-mono font-bold text-lg">
                  R{result.data.totalExposureZar.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="text-xs mt-1 opacity-60">
              {result.data.meta.modulesRun} modules · {result.data.meta.durationMs}ms
            </div>
          </div>

          {result.data.results.map((r, i) => (
            <div key={i} className="bg-white rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${statusDot(r.status)}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-semibold text-[#1A2332]">{r.moduleName}</h3>
                    {r.exposureZar > 0 && (
                      <span className="font-mono text-sm text-red-600">
                        R{r.exposureZar.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{r.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
