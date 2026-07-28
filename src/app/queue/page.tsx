'use client';

import { useState } from 'react';
import { Search, Eye, Check, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

type ParsingState = 'idle' | 'uploading' | 'extracting' | 'compliant' | 'held' | 'warn' | 'error' | 'configured';

function statusBadge(status: string) {
  const map: Record<string, string> = {
    cleared: 'bg-green-100 text-green-700',
    review: 'bg-amber-100 text-amber-700',
    held: 'bg-red-100 text-red-700',
    risk_high: 'bg-red-100 text-red-700',
    risk_medium: 'bg-amber-100 text-amber-700',
    risk_low: 'bg-green-100 text-green-700',
    Pending: 'bg-gray-100 text-gray-700',
    'Review Required': 'bg-amber-100 text-amber-700',
    Approved: 'bg-green-100 text-green-700',
    'In CargoWise': 'bg-blue-100 text-blue-700',
    Failed: 'bg-red-100 text-red-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}

export default function QueuePage() {
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Review Required' | 'Approved' | 'In CargoWise'>('All');
  const [search, setSearch] = useState('');
  const [importer, setImporter] = useState('');
  const [parsingState, setParsingState] = useState<ParsingState>('idle');
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [useDemo, setUseDemo] = useState(true);
  const [demoShipments, setDemoShipments] = useState([
    { id: 'CIQ-2026-00247', reference: 'CIQ-2026-00247', shipper: 'Shenzhen Tech Co Ltd', consignee: 'Demo Freight Imports', route: 'CNSHA ? ZADUR', type: 'Sea FCL Import', status: 'Pending', risk: 2 },
    { id: 'CIQ-2026-00248', reference: 'CIQ-2026-00248', shipper: 'Guangzhou Electronics Ltd', consignee: 'ABC Trading', route: 'CNGZH ? ZAJNB', type: 'Sea LCL Import', status: 'Review Required', risk: 4 },
    { id: 'CIQ-2026-00249', reference: 'CIQ-2026-00249', shipper: 'Shanghai Steel Works', consignee: 'Metal Imports SA', route: 'CNSHA ? ZADUR', type: 'Sea FCL Import', status: 'Approved', risk: 1 },
    { id: 'CIQ-2026-00250', reference: 'CIQ-2026-00250', shipper: 'Yiwu Goods Trading', consignee: 'Retail Plus', route: 'CNYIW ? ZAHRB', type: 'Sea LCL Import', status: 'Pending', risk: 3 },
    { id: 'CIQ-2026-00251', reference: 'CIQ-2026-00251', shipper: 'Ningbo Port Logistics', consignee: 'Global Freight', route: 'CNNGB ? ZADUR', type: 'Sea FCL Import', status: 'In CargoWise', risk: 2 },
  ]);

  const filtered = demoShipments.filter((s) => {
    if (activeTab !== 'All' && s.status !== activeTab) return false;
    if (search && !s.reference.toLowerCase().includes(search.toLowerCase()) && !s.shipper.toLowerCase().includes(search.toLowerCase())) return false;
    if (importer && !s.consignee.toLowerCase().includes(importer.toLowerCase())) return false;
    return true;
  });

  const handleFileUpload = async (file: File) => {
    setParsingState('uploading');
    setParsedResult(null);

    try {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey || apiKey === 'PASTE_YOUR_GEMINI_KEY_HERE') {
        setParsingState('configured');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.configured === false) {
        setParsingState('configured');
        return;
      }

      if (data.error) {
        setParsingState('error');
        return;
      }

      if (data.couldNotRead) {
        setParsedResult(data);
        setParsingState('warn');
        return;
      }

      if (data.report) {
        const { report } = data;
        const newShipment = {
          id: report.shipmentId,
          reference: report.reference || data.extraction?.shipmentRef || `PARSED-${Date.now()}`,
          shipper: 'Parsed document',
          consignee: 'Parsed document',
          route: '—',
          type: 'AI Parsed',
          status: report.overallStatus === 'hold' ? 'Review Required' : report.overallStatus === 'warn' ? 'Review Required' : 'Approved',
          risk: report.riskScore,
        };
        setDemoShipments((prev) => [newShipment, ...prev]);
        setParsedResult(data);
        setParsingState(report.overallStatus === 'hold' ? 'held' : report.overallStatus === 'warn' ? 'warn' : 'compliant');
      }
    } catch (err) {
      console.error('[Parse Upload Error]:', err);
      setParsingState('error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const allTabs: ('All' | 'Pending' | 'Review Required' | 'Approved' | 'In CargoWise')[] = ['All', 'Pending', 'Review Required', 'Approved', 'In CargoWise'];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#1A2332]">Shipment Queue</h1>
          <button
            onClick={() => document.getElementById('file-input')?.click()}
            className="flex items-center gap-2 bg-[#D97706] hover:bg-[#B45309] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
          <input id="file-input" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" className="hidden" onChange={handleFileSelect} />
        </div>

        {parsingState !== 'idle' && (
          <div className="mb-4 rounded-lg border p-4">
            {parsingState === 'uploading' && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
                Uploading document...
              </div>
            )}
            {parsingState === 'extracting' && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
                Extracting shipment data with AI...
              </div>
            )}
            {parsingState === 'compliant' && parsedResult && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-700 font-medium">
                  <Check className="w-4 h-4" />
                  Parsed successfully — compliance check complete
                </div>
                {parsedResult.extraction && (
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-green-50 rounded p-3">
                    <span>HS Code: {parsedResult.extraction.hsCode || '—'}</span>
                    <span>Declared Value: {parsedResult.extraction.declaredValueZar ? `R${parsedResult.extraction.declaredValueZar.toLocaleString()}` : '—'}</span>
                    <span>Product Type: {parsedResult.extraction.productType || '—'}</span>
                    <span>Confidence: {parsedResult.extraction.confidence || '—'}</span>
                    {parsedResult.report && (
                      <>
                        <span className="col-span-2 font-medium text-gray-800">Status: {parsedResult.report.overallStatus}</span>
                        <span className="col-span-2">Exposure: R{parsedResult.report.totalExposureZar?.toLocaleString()}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            {parsingState === 'held' && parsedResult && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-red-700 font-medium">
                  <X className="w-4 h-4" />
                  Held — compliance review required
                </div>
                {parsedResult.report && (
                  <div className="text-xs text-gray-600 bg-red-50 rounded p-3">
                    Exposure: R{parsedResult.report.totalExposureZar?.toLocaleString()} — {parsedResult.report.results?.length ?? 0} findings
                  </div>
                )}
              </div>
            )}
            {parsingState === 'warn' && parsedResult && (
              <div className="text-sm text-amber-700">
                Could not read this document clearly enough for a full compliance check. Key fields are missing or unclear. Please review manually.
              </div>
            )}
            {parsingState === 'configured' && (
              <div className="text-sm text-amber-700">
                AI parsing is not configured. Add a Gemini API key to enable document extraction.
              </div>
            )}
            {parsingState === 'error' && (
              <div className="text-sm text-red-700">
                Parsing failed. Please try again with a clearer document.
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setUseDemo(true)}
            className={cn('px-3 py-1.5 text-xs font-medium rounded-full transition-colors', useDemo ? 'bg-[#B8860B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
          >
            Try a sample (demo)
          </button>
          {!useDemo && (
            <button
              onClick={() => { setUseDemo(true); setDemoShipments([{ id: 'CIQ-2026-00247', reference: 'CIQ-2026-00247', shipper: 'Shenzhen Tech Co Ltd', consignee: 'Demo Freight Imports', route: 'CNSHA ? ZADUR', type: 'Sea FCL Import', status: 'Pending', risk: 2 }, { id: 'CIQ-2026-00248', reference: 'CIQ-2026-00248', shipper: 'Guangzhou Electronics Ltd', consignee: 'ABC Trading', route: 'CNGZH ? ZAJNB', type: 'Sea LCL Import', status: 'Review Required', risk: 4 }, { id: 'CIQ-2026-00249', reference: 'CIQ-2026-00249', shipper: 'Shanghai Steel Works', consignee: 'Metal Imports SA', route: 'CNSHA ? ZADUR', type: 'Sea FCL Import', status: 'Approved', risk: 1 }, { id: 'CIQ-2026-00250', reference: 'CIQ-2026-00250', shipper: 'Yiwu Goods Trading', consignee: 'Retail Plus', route: 'CNYIW ? ZAHRB', type: 'Sea LCL Import', status: 'Pending', risk: 3 }, { id: 'CIQ-2026-00251', reference: 'CIQ-2026-00251', shipper: 'Ningbo Port Logistics', consignee: 'Global Freight', route: 'CNNGB ? ZADUR', type: 'Sea FCL Import', status: 'In CargoWise', risk: 2 }]); }}
              className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Reset demo data
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 mb-4">
          <div className="flex items-center gap-4 p-4 border-b border-gray-100">
            <div className="flex gap-1">
            {allTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn('px-3 py-1.5 text-sm font-medium rounded-t transition-colors', activeTab === tab ? 'text-[#B8860B] border-b-2 border-[#D97706]' : 'text-gray-600 hover:text-gray-900')}
                >
                  {tab} ({demoShipments.filter((s) => activeTab === 'All' || s.status === activeTab).length})
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search reference or shipper..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-3 py-1.5 border border-gray-300 rounded text-sm w-64 focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <input type="text" placeholder="Filter importer..." value={importer} onChange={(e) => setImporter(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded text-sm w-48 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>

          <div className="w-full border-collapse">
            <div className="bg-[#F1F4F8]">
              <div className="grid grid-cols-[40px_1fr_1.2fr_1.2fr_1.2fr_1fr_1fr_120px] gap-4 px-4 py-2 text-xs font-semibold text-gray-600 uppercase">
                <div>Risk</div>
                <div>Reference</div>
                <div>Shipper</div>
                <div>Consignee</div>
                <div>Route</div>
                <div>Type</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
            </div>

            {filtered.map((row) => (
              <div key={row.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-[40px_1fr_1.2fr_1.2fr_1.2fr_1fr_1fr_120px] gap-4 px-4 py-3 items-center text-sm">
                  <div className="flex items-center"><div className={cn('w-3.5 h-3.5 rounded-full', row.risk === 1 ? 'bg-green-400' : row.risk === 2 ? 'bg-blue-500' : row.risk === 3 ? 'bg-amber-500' : 'bg-red-500')} /></div>
                  <div className="font-medium text-[#0D1B2A]">{row.reference}</div>
                  <div className="text-gray-700">{row.shipper}</div>
                  <div className="text-gray-700">{row.consignee}</div>
                  <div className="text-gray-700">{row.route}</div>
                  <div className="text-gray-700">{row.type}</div>
                  <div><span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusBadge(row.status))}>{row.status}</span></div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-200 rounded cursor-not-allowed opacity-50" title="View detail" disabled><Eye className="w-4 h-4 text-gray-600" /></button>
                    <button className="p-1 hover:bg-green-100 rounded cursor-not-allowed opacity-50" title="Approve shipment" disabled><Check className="w-4 h-4 text-green-600" /></button>
                    <button className="p-1 hover:bg-red-100 rounded cursor-not-allowed opacity-50" title="Reject shipment" disabled><X className="w-4 h-4 text-red-600" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
