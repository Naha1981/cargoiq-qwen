'use client';

import { useState } from 'react';
import { Upload, Plus, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const rateCards = [
  { carrier: 'Maersk', chargeType: 'Ocean Freight', lane: 'Shanghai – Durban', rate: 1850, currency: 'USD', validFrom: '2025-01-01', validTo: '2025-12-31' },
  { carrier: 'MSC', chargeType: 'FSC', lane: 'Rotterdam – Cape Town', rate: 420, currency: 'USD', validFrom: '2025-01-01', validTo: '2025-06-30' },
  { carrier: 'CMA CGM', chargeType: 'Origin THC', lane: 'Singapore – Gqeberha', rate: 650, currency: 'ZAR', validFrom: '2025-03-01', validTo: '2025-03-31' },
];

const auditItems = [
  { charge: 'Ocean Freight', billed: 18500, rateCard: 17200, variance: 1300, status: 'overcharge' },
  { charge: 'FSC', billed: 4200, rateCard: 3800, variance: 400, status: 'overcharge' },
  { charge: 'Origin THC', billed: 2100, rateCard: 2100, variance: 0, status: 'ok' },
  { charge: 'Destination THC', billed: 3800, rateCard: 3500, variance: 300, status: 'overcharge' },
  { charge: 'Documentation', billed: 1200, rateCard: 1200, variance: 0, status: 'ok' },
];

const carriers = ['Maersk', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'OOCL'];
const regions = ['Global', 'Africa', 'Asia', 'Europe', 'Americas'];

export default function CarrierAuditPage() {
  const [activeTab, setActiveTab] = useState<'rate-cards' | 'upload-audit' | 'fsc-checker'>('rate-cards');

  const totalOvercharge = auditItems.reduce((sum, item) => item.status === 'overcharge' ? sum + item.variance : sum, 0);
  const overchargeItems = auditItems.filter((item) => item.status === 'overcharge');

  return (
    <div className="min-h-screen bg-[#F1F4F8] text-[#0D1B2A] font-sans">
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="text-3xl font-bold text-[#1A2332] mb-6">Carrier Audit</h1>

        <div className="flex gap-1 rounded-lg bg-white p-1 border border-[#E2E8F0] mb-6 w-fit">
          {[
            { key: 'rate-cards', label: 'Rate Cards' },
            { key: 'upload-audit', label: 'Upload & Audit' },
            { key: 'fsc-checker', label: 'FSC Checker' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === tab.key
                  ? 'bg-[#1A2332] text-white'
                  : 'text-gray-600 hover:text-[#1A2332]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'rate-cards' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button className="inline-flex items-center gap-2 bg-[#B8860B] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#9a7209] transition-colors">
                <Plus className="h-4 w-4" />
                Add Rate Card
              </button>
            </div>
            <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F1F4F8] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Carrier</th>
                      <th className="px-4 py-3">Charge Type</th>
                      <th className="px-4 py-3">Lane</th>
                      <th className="px-4 py-3 text-right">Rate</th>
                      <th className="px-4 py-3">Currency</th>
                      <th className="px-4 py-3">Valid From</th>
                      <th className="px-4 py-3">Valid To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {rateCards.map((row) => (
                      <tr key={row.lane} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium">{row.carrier}</td>
                        <td className="px-4 py-3 text-gray-600">{row.chargeType}</td>
                        <td className="px-4 py-3 text-gray-600">{row.lane}</td>
                        <td className="px-4 py-3 text-right font-mono">{row.rate.toLocaleString()}</td>
                        <td className="px-4 py-3">{row.currency}</td>
                        <td className="px-4 py-3 text-gray-500">{row.validFrom}</td>
                        <td className="px-4 py-3 text-gray-500">{row.validTo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upload-audit' && (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-[#E2E8F0] bg-white p-8 text-center">
              <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-1">Drag and drop invoice PDFs here</p>
              <p className="text-xs text-gray-400">or click to browse</p>
            </div>

            <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F1F4F8] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Charge</th>
                      <th className="px-4 py-3 text-right">Billed Amount</th>
                      <th className="px-4 py-3 text-right">Rate Card</th>
                      <th className="px-4 py-3 text-right">Variance</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {auditItems.map((row, idx) => (
                      <tr
                        key={idx}
                        className={cn(
                          'hover:bg-gray-50 transition-colors',
                          row.status === 'overcharge' ? 'bg-amber-50' : ''
                        )}
                      >
                        <td className="px-4 py-3 font-medium">{row.charge}</td>
                        <td className="px-4 py-3 text-right font-mono">{row.billed.toLocaleString('en-ZA')}</td>
                        <td className="px-4 py-3 text-right font-mono text-gray-600">{row.rateCard.toLocaleString('en-ZA')}</td>
                        <td className="px-4 py-3 text-right font-mono text-red-600">+{row.variance.toLocaleString('en-ZA')}</td>
                        <td className="px-4 py-3">
                          {row.status === 'overcharge' ? (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                              Overcharge
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              OK
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {row.status === 'overcharge' && (
                            <button className="inline-flex items-center gap-1 rounded-md border border-[#B8860B] text-[#B8860B] px-3 py-1 text-xs font-medium hover:bg-[#B8860B] hover:text-white transition-colors">
                              <FileText className="h-3 w-3" />
                              Generate Dispute Notice
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="sticky bottom-0 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-medium text-amber-800">
                Total overcharges: R{totalOvercharge.toLocaleString('en-ZA')} across {overchargeItems.length} line items
              </span>
            </div>
          </div>
        )}

        {activeTab === 'fsc-checker' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#1A2332]">FSC Parameters</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
                  <select className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm bg-white">
                    <option value="">Select carrier</option>
                    {carriers.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                  <input type="date" className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Freight Amount (ZAR)</label>
                  <input type="number" placeholder="e.g. 50000" className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Billed FSC %</label>
                  <input type="number" step="0.01" placeholder="e.g. 35.5" className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <div className="flex gap-4">
                    {regions.map((r) => (
                      <label key={r} className="flex items-center gap-2 text-sm">
                        <input type="radio" name="region" value={r} className="accent-[#B8860B]" />
                        {r}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-4">FSC CALCULATION RESULT</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Diesel Price (ZAR/l)</p>
                    <p className="text-lg font-mono font-semibold text-[#1A2332]">24.35</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Correct FSC %</p>
                    <p className="text-lg font-mono font-semibold text-[#1A2332]">32.40%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Correct Amount (ZAR)</p>
                    <p className="text-lg font-mono font-semibold text-green-600">16,200.00</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Charged Amount (ZAR)</p>
                    <p className="text-lg font-mono font-semibold text-red-600">18,500.00</p>
                  </div>
                </div>
                <div className="mt-4 rounded-lg bg-red-50 border border-red-100 p-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-red-700">Overcharge Difference</span>
                  <span className="text-lg font-mono font-bold text-red-600">R2,300.00</span>
                </div>
              </div>
              <button className="w-full inline-flex items-center justify-center gap-2 bg-[#B8860B] text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-[#9a7209] transition-colors">
                <FileText className="h-4 w-4" />
                Generate FSC Dispute Notice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
