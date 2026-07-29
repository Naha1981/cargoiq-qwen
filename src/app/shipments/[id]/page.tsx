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
  if (status === 'pass') return 'bg-success/20 text-success border-success/30';
  if (status === 'warn') return 'bg-amber-100 text-primary-container border-amber-200';
  return 'bg-risk-red/10 text-risk-red border-risk-red';
};

const statusIcon = (status: string) => {
  if (status === 'pass') return <CheckCircle2 className="w-5 h-5 text-success" />;
  if (status === 'warn') return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  return <XCircle className="w-5 h-5 text-risk-red" />;
};

const penaltyBadge = (exposure: number) => {
  if (exposure === 0) return null;
    return (
      <span className="text-xs font-mono text-risk-red bg-risk-red/10 border border-risk-red px-1.5 py-0.5 rounded">
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
    <div className="min-h-screen bg-surface-container-lowest p-6">
      <div className="flex gap-6">
        <div className="w-[55%] space-y-6">
          <div className="bg-surface-container rounded-lg border border-outline-variant p-6">
            <h2 className="text-lg font-semibold text-on-surface mb-4">Extracted Shipment Data</h2>
            <div className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-4">
              <div className="text-xs font-medium uppercase text-on-surface-variant flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Reference
              </div>
              <div className="text-sm text-on-surface font-medium">{shipmentData.reference}</div>

              <div className="text-xs font-medium uppercase text-on-surface-variant flex items-center gap-1">
                <Ship className="w-3.5 h-3.5" /> Shipper
              </div>
              <div className="text-sm text-on-surface">{shipmentData.shipper}</div>

              <div className="text-xs font-medium uppercase text-on-surface-variant">Consignee</div>
              <div className="text-sm text-on-surface">{shipmentData.consignee}</div>

              <div className="text-xs font-medium uppercase text-on-surface-variant">Origin Port</div>
              <div className="text-sm text-on-surface font-mono">{shipmentData.originPort}</div>

              <div className="text-xs font-medium uppercase text-on-surface-variant">Destination Port</div>
              <div className="text-sm text-on-surface font-mono">{shipmentData.destinationPort}</div>

              <div className="text-xs font-medium uppercase text-on-surface-variant">Type</div>
              <div className="text-sm text-on-surface">{shipmentData.type}</div>

              <div className="text-xs font-medium uppercase text-on-surface-variant flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" /> HS Code
              </div>
              <div className="text-sm text-on-surface font-mono">{shipmentData.hsCode}</div>

              <div className="text-xs font-medium uppercase text-on-surface-variant flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Invoice Value
              </div>
              <div className="text-sm text-on-surface">{shipmentData.invoiceValue}</div>

              <div className="text-xs font-medium uppercase text-on-surface-variant flex items-center gap-1">
                <Weight className="w-3.5 h-3.5" /> Weight
              </div>
              <div className="text-sm text-on-surface">{shipmentData.weight}</div>

              <div className="text-xs font-medium uppercase text-on-surface-variant flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> ETA
              </div>
              <div className="text-sm text-on-surface">{shipmentData.eta}</div>

              <div className="text-xs font-medium uppercase text-on-surface-variant flex items-center gap-1">
                <Plane className="w-3.5 h-3.5" /> AWB / BL
              </div>
              <div className="text-sm text-on-surface font-mono">{shipmentData.awbBl}</div>
            </div>
          </div>

          <div className="bg-surface-container rounded-lg border border-outline-variant">
            <button
              onClick={() => setHsOpen(!hsOpen)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-container-highest transition-colors"
            >
              <span className="text-sm font-semibold text-on-surface">Check HS Code</span>
              {hsOpen ? <ChevronDown className="w-4 h-4 text-on-surface-variant" /> : <ChevronRight className="w-4 h-4 text-on-surface-variant" />}
            </button>
            {hsOpen && (
              <div className="px-4 pb-4 border-t border-outline-variant pt-4 space-y-3">
                <div>
                  <label className="text-xs text-on-surface-variant mb-1 block">HS Code</label>
                  <input
                    type="text"
                    value={hsCode}
                    onChange={(e) => setHsCode(e.target.value)}
                    placeholder="Enter HS code..."
                    className="w-full border border-outline-variant rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant mb-1 block">Compliance Tier</label>
                  <select className="w-full border border-outline-variant rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container">
                    <option>Tier 1 - Standard</option>
                    <option>Tier 2 - Enhanced</option>
                    <option>Tier 3 - Restricted</option>
                  </select>
                </div>
                <button
                  onClick={runHsClassifier}
                  className="bg-primary-container hover:bg-primary text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
                >
                  <Scale className="w-4 h-4" />
                  Classify
                </button>
                {hsResult && (
                  <div className={cn('flex items-center gap-2 text-sm', hsResult === 'pass' ? 'text-success' : 'text-risk-red')}>
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
          <div className="bg-surface-container rounded-lg border border-outline-variant">
            <div className="p-4 border-b border-outline-variant flex items-center justify-between">
              <h2 className="text-lg font-semibold text-on-surface">Compliance Shield</h2>
              <span className={cn('text-xs font-bold uppercase px-2.5 py-1 rounded-full border', statusBadge(overallStatus))}>
                {overallStatus === 'pass' ? 'PASS' : overallStatus === 'warn' ? 'REVIEW REQUIRED' : 'HOLD'}
              </span>
            </div>

            <div className="p-4 space-y-2">
              {complianceModules.map((mod, idx) => (
                <div key={idx} className="border border-outline-variant rounded">
                  <button
                    onClick={() => toggleModule(idx)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-surface-container-highest transition-colors"
                  >
                    {statusIcon(mod.status)}
                    <span className="text-sm text-on-surface flex-1 text-left">{mod.name}</span>
                    {penaltyBadge(mod.exposure)}
                    {moduleStates[idx] ? (
                      <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                    )}
                  </button>
                  {moduleStates[idx] && (
                    <div className="px-3 pb-3 pt-0">
                      <p className="text-xs text-on-surface-variant bg-surface-container rounded p-2">{mod.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalExposure > 0 && (
              <div className="px-4 py-3 border-t border-outline-variant bg-primary-container/10">
                <div className="text-xs text-primary-container">
                  Total Exposure: <span className="font-mono font-bold">R{totalExposure.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="p-4 border-t border-outline-variant flex flex-wrap gap-2">
              <button
                disabled={overallStatus === 'hold'}
                className={cn(
                  'px-4 py-2 rounded text-sm font-medium flex items-center gap-2',
                  overallStatus === 'hold'
                    ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'
                    : 'bg-success hover:bg-success text-white'
                )}
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
              <button className="px-4 py-2 rounded text-sm font-medium border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Request Correction
              </button>
              <button className="px-4 py-2 rounded text-sm font-medium border border-risk-red text-risk-red hover:bg-risk-red/10 flex items-center gap-2">
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
