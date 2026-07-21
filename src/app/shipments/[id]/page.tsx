'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, AlertTriangle, XCircle, Check, FileText, Scale, Ship, Hash, DollarSign, Weight, Calendar, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';

const shipmentData = {
  reference: 'CIQ-2026-00247',
  shipper: 'Shenzhen Tech Co Ltd',
  consignee: 'Demo Freight Imports',
  originPort: 'CNSHA',
  destinationPort: 'ZADUR',
  type: 'Sea FCL Import',
  hsCode: '85171100',
  invoiceValue: 'USD 45,000',
  weight: '245.5 KGS',
  eta: '2026-07-25',
  awbBl: 'MAEU9876543',
};

const complianceModules = [
  { name: 'SASIM Imp SPV Check', status: 'pass', message: 'No sanctioned third-party matches detected for this shipment or parties.', exposure: 0 },
  { name: 'CIT Compliance', status: 'pass', message: 'Confirmed investment allowance valid through 2026-12.', exposure: 0 },
  { name: 'Cigarette Tax Compliance', status: 'pass', message: 'No HS codes flagged for cigarette tax anomalies.', exposure: 0 },
  { name: 'Motor Vehicle Check', status: 'warn', message: 'Vehicle HS code detected - verify R-Value compliance before release.', exposure: 12500 },
  { name: 'Diamond Importer Verification', status: 'pass', message: 'Importer not listed on diamond importer registry.', exposure: 0 },
  { name: 'Bilateral Agreement', status: 'pass', message: 'Origin port CNSHA has active bilateral agreement with ZADUR.', exposure: 0 },
  { name: 'SANctions SPV Monitor', status: 'pass', message: 'Shipment not flagged on real-time sanctions watchlist.', exposure: 0 },
];

const overallStatus = complianceModules.some((m) => m.status === 'hold')
  ? 'hold'
  : complianceModules.some((m) => m.status === 'warn')
    ? 'warn'
    : 'pass';

const statusBadge = (status: string) => {
  if (status === 'pass') return 'bg-green-100 text-green-700 border-green-200';
  if (status === 'warn') return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-red-100 text-red-700 border-red-200';
};

const statusIcon = (status: string) => {
  if (status === 'pass') return <CheckCircle2 className="w-5 h-5 text-green-600" />;
  if (status === 'warn') return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  return <XCircle className="w-5 h-5 text-red-600" />;
};

const penaltyBadge = (exposure: number) => {
  if (exposure === 0) return null;
  return (
    <span className="text-xs font-mono text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
      R{exposure.toLocaleString()}
    </span>
  );
};

export default function ShipmentDetailPage() {
  const [hsOpen, setHsOpen] = useState(false);
  const [hsCode, setHsCode] = useState('');
  const [hsResult, setHsResult] = useState<'pass' | 'hold' | null>(null);
  const [moduleStates, setModuleStates] = useState<Record<number, boolean>>({});

  const toggleModule = (idx: number) => {
    setModuleStates((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const runHsClassifier = () => {
    if (!hsCode.trim()) return;
    setHsResult(hsCode.length >= 8 ? 'pass' : 'hold');
  };

  const totalExposure = complianceModules.reduce((sum, m) => sum + m.exposure, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="flex gap-6">
        <div className="w-[55%] space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#1A2332] mb-4">Extracted Shipment Data</h2>
            <div className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-4">
              <div className="text-xs font-medium uppercase text-[#4A5568] flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Reference
              </div>
              <div className="text-sm text-[#0D1B2A] font-medium">{shipmentData.reference}</div>

              <div className="text-xs font-medium uppercase text-[#4A5568] flex items-center gap-1">
                <Ship className="w-3.5 h-3.5" /> Shipper
              </div>
              <div className="text-sm text-[#0D1B2A]">{shipmentData.shipper}</div>

              <div className="text-xs font-medium uppercase text-[#4A5568]">Consignee</div>
              <div className="text-sm text-[#0D1B2A]">{shipmentData.consignee}</div>

              <div className="text-xs font-medium uppercase text-[#4A5568]">Origin Port</div>
              <div className="text-sm text-[#0D1B2A] font-mono">{shipmentData.originPort}</div>

              <div className="text-xs font-medium uppercase text-[#4A5568]">Destination Port</div>
              <div className="text-sm text-[#0D1B2A] font-mono">{shipmentData.destinationPort}</div>

              <div className="text-xs font-medium uppercase text-[#4A5568]">Type</div>
              <div className="text-sm text-[#0D1B2A]">{shipmentData.type}</div>

              <div className="text-xs font-medium uppercase text-[#4A5568] flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" /> HS Code
              </div>
              <div className="text-sm text-[#0D1B2A] font-mono">{shipmentData.hsCode}</div>

              <div className="text-xs font-medium uppercase text-[#4A5568] flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Invoice Value
              </div>
              <div className="text-sm text-[#0D1B2A]">{shipmentData.invoiceValue}</div>

              <div className="text-xs font-medium uppercase text-[#4A5568] flex items-center gap-1">
                <Weight className="w-3.5 h-3.5" /> Weight
              </div>
              <div className="text-sm text-[#0D1B2A]">{shipmentData.weight}</div>

              <div className="text-xs font-medium uppercase text-[#4A5568] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> ETA
              </div>
              <div className="text-sm text-[#0D1B2A]">{shipmentData.eta}</div>

              <div className="text-xs font-medium uppercase text-[#4A5568] flex items-center gap-1">
                <Plane className="w-3.5 h-3.5" /> AWB / BL
              </div>
              <div className="text-sm text-[#0D1B2A] font-mono">{shipmentData.awbBl}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <button
              onClick={() => setHsOpen(!hsOpen)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-semibold text-[#1A2332]">Check HS Code</span>
              {hsOpen ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
            </button>
            {hsOpen && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">HS Code</label>
                  <input
                    type="text"
                    value={hsCode}
                    onChange={(e) => setHsCode(e.target.value)}
                    placeholder="Enter HS code..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Compliance Tier</label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option>Tier 1 - Standard</option>
                    <option>Tier 2 - Enhanced</option>
                    <option>Tier 3 - Restricted</option>
                  </select>
                </div>
                <button
                  onClick={runHsClassifier}
                  className="bg-[#D97706] hover:bg-[#B45309] text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
                >
                  <Scale className="w-4 h-4" />
                  Classify
                </button>
                {hsResult && (
                  <div className={cn('flex items-center gap-2 text-sm', hsResult === 'pass' ? 'text-green-600' : 'text-red-600')}>
                    {hsResult === 'pass' ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {hsResult === 'pass'
                      ? 'HS code validated - no restrictions detected.'
                      : 'HS code flagged - review required before classification.'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-[45%] space-y-4">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1A2332]">Compliance Shield</h2>
              <span className={cn('text-xs font-bold uppercase px-2.5 py-1 rounded-full border', statusBadge(overallStatus))}>
                {overallStatus === 'pass' ? 'PASS' : overallStatus === 'warn' ? 'REVIEW REQUIRED' : 'HOLD'}
              </span>
            </div>

            <div className="p-4 space-y-2">
              {complianceModules.map((mod, idx) => (
                <div key={idx} className="border border-gray-100 rounded">
                  <button
                    onClick={() => toggleModule(idx)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                  >
                    {statusIcon(mod.status)}
                    <span className="text-sm text-[#1A2332] flex-1 text-left">{mod.name}</span>
                    {penaltyBadge(mod.exposure)}
                    {moduleStates[idx] ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  {moduleStates[idx] && (
                    <div className="px-3 pb-3 pt-0">
                      <p className="text-xs text-gray-600 bg-gray-50 rounded p-2">{mod.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalExposure > 0 && (
              <div className="px-4 py-3 border-t border-gray-100 bg-amber-50">
                <div className="text-xs text-amber-700">
                  Total Exposure: <span className="font-mono font-bold">R{totalExposure.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="p-4 border-t border-gray-100 flex flex-wrap gap-2">
              <button
                disabled={overallStatus === 'hold'}
                className={cn(
                  'px-4 py-2 rounded text-sm font-medium flex items-center gap-2',
                  overallStatus === 'hold'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                )}
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
              <button className="px-4 py-2 rounded text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Request Correction
              </button>
              <button className="px-4 py-2 rounded text-sm font-medium border border-red-300 text-red-700 hover:bg-red-50 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
