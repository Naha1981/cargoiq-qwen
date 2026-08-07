'use client';

import { useState } from 'react';
import { Search, Eye, Check, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';

type ParsingState =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'compliant'
  | 'held'
  | 'warn'
  | 'error'
  | 'configured';

type ShipmentStatus =
  | 'All'
  | 'Pending'
  | 'Review Required'
  | 'Approved'
  | 'In CargoWise';

interface DemoShipment {
  id: string;
  reference: string;
  shipper: string;
  consignee: string;
  route: string;
  type: string;
  status: string;
  risk: number;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    cleared: 'bg-success/10 border border-success/30 text-success',
    review:
      'bg-primary-container/10 border border-primary-container/30 text-primary-container',
    held: 'bg-risk-red/10 border border-risk-red/30 text-risk-red',
    risk_high: 'bg-risk-red/10 border border-risk-red/30 text-risk-red',
    risk_medium:
      'bg-primary-container/10 border border-primary-container/30 text-primary-container',
    risk_low: 'bg-success/10 border border-success/30 text-success',
    Pending:
      'bg-surface-container border border-outline-variant text-on-surface-variant',
    'Review Required':
      'bg-primary-container/10 border border-primary-container/30 text-primary-container',
    Approved: 'bg-success/10 border border-success/30 text-success',
    'In CargoWise': 'bg-tertiary/10 border border-tertiary/30 text-tertiary',
    Failed: 'bg-risk-red/10 border border-risk-red/30 text-risk-red',
  };
  return (
    map[status] ??
    'bg-surface-container border border-outline-variant text-on-surface-variant'
  );
}

const SAMPLE_SHIPMENTS: DemoShipment[] = [
  {
    id: 'CIQ-2026-00247',
    reference: 'CIQ-2026-00247',
    shipper: 'Shenzhen Tech Co Ltd',
    consignee: 'Demo Freight Imports',
    route: 'CNSHA \u2192 ZADUR',
    type: 'Sea FCL Import',
    status: 'Pending',
    risk: 2,
  },
  {
    id: 'CIQ-2026-00248',
    reference: 'CIQ-2026-00248',
    shipper: 'Guangzhou Electronics Ltd',
    consignee: 'ABC Trading',
    route: 'CNGZH \u2192 ZAJNB',
    type: 'Sea LCL Import',
    status: 'Review Required',
    risk: 4,
  },
  {
    id: 'CIQ-2026-00249',
    reference: 'CIQ-2026-00249',
    shipper: 'Shanghai Steel Works',
    consignee: 'Metal Imports SA',
    route: 'CNSHA \u2192 ZADUR',
    type: 'Sea FCL Import',
    status: 'Approved',
    risk: 1,
  },
  {
    id: 'CIQ-2026-00250',
    reference: 'CIQ-2026-00250',
    shipper: 'Yiwu Goods Trading',
    consignee: 'Retail Plus',
    route: 'CNYIW \u2192 ZAHRB',
    type: 'Sea LCL Import',
    status: 'Pending',
    risk: 3,
  },
  {
    id: 'CIQ-2026-00251',
    reference: 'CIQ-2026-00251',
    shipper: 'Ningbo Port Logistics',
    consignee: 'Global Freight',
    route: 'CNNGB \u2192 ZADUR',
    type: 'Sea FCL Import',
    status: 'In CargoWise',
    risk: 2,
  },
];

const ALL_TABS: ShipmentStatus[] = [
  'All',
  'Pending',
  'Review Required',
  'Approved',
  'In CargoWise',
];

const COLS =
  'grid grid-cols-[40px_1fr_1.2fr_1.2fr_1.2fr_1fr_1fr_120px] gap-4 items-center';

export default function QueuePage() {
  const [activeTab, setActiveTab] = useState<ShipmentStatus>('All');
  const [search, setSearch] = useState('');
  const [importer, setImporter] = useState('');
  const [parsingState, setParsingState] = useState<ParsingState>('idle');
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [useDemo, setUseDemo] = useState(true);
  const [demoShipments, setDemoShipments] =
    useState<DemoShipment[]>(SAMPLE_SHIPMENTS);
  const [selectedShipment, setSelectedShipment] = useState<DemoShipment | null>(null);

  const filtered = demoShipments.filter((s) => {
    if (activeTab !== 'All' && s.status !== activeTab) return false;
    if (
      search &&
      !s.reference.toLowerCase().includes(search.toLowerCase()) &&
      !s.shipper.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (
      importer &&
      !s.consignee.toLowerCase().includes(importer.toLowerCase())
    )
      return false;
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
      const res = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });
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
        const newShipment: DemoShipment = {
          id: report.shipmentId,
          reference:
            report.reference ||
            data.extraction?.shipmentRef ||
            `PARSED-${Date.now()}`,
          shipper: 'Parsed document',
          consignee: 'Parsed document',
          route: ' ',
          type: 'AI Parsed',
          status:
            report.overallStatus === 'hold'
              ? 'Review Required'
              : report.overallStatus === 'warn'
                ? 'Review Required'
                : 'Approved',
          risk: report.riskScore,
        };
        setDemoShipments((prev) => [newShipment, ...prev]);
        setParsedResult(data);
        setParsingState(
          report.overallStatus === 'hold'
            ? 'held'
            : report.overallStatus === 'warn'
              ? 'warn'
              : 'compliant',
        );
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

  const riskDotClass = (risk: number) =>
    risk === 1
      ? 'bg-success'
      : risk === 2
        ? 'bg-info'
        : risk === 3
          ? 'bg-warn'
          : 'bg-risk-red';

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-on-surface">
              <Logo size="sm" />
              <span className="text-on-surface-variant font-normal">/</span>
              Shipment Queue
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Upload a customs document to run an AI compliance check, or browse
              the sample queue below.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="file-input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              onClick={() => document.getElementById('file-input')?.click()}
              className="ember-button flex items-center gap-2 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        </div>

        {/* Honesty banner: the queue below is sample data */}
        {useDemo && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-warn" />
            You&rsquo;re viewing sample data. The sample queue shows how CargoIQ
            organises shipments; upload your own document to run a real
            compliance check.
          </div>
        )}

        {/* Parsing state banner */}
        {parsingState !== 'idle' && (
          <div className="mb-4 rounded-md border border-outline-variant bg-surface-container-lowest p-4">
            {parsingState === 'uploading' && (
              <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                Uploading document&hellip;
              </div>
            )}
            {parsingState === 'extracting' && (
              <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                Extracting shipment data with AI&hellip;
              </div>
            )}
            {parsingState === 'compliant' && parsedResult && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-success font-medium">
                  <Check className="w-4 h-4" />
                  Parsed successfully &mdash; compliance check complete
                </div>
                {parsedResult.extraction && (
                  <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant bg-success/10 rounded p-3">
                    <span>
                      HS Code: {parsedResult.extraction.hsCode || ' '}
                    </span>
                    <span>
                      Declared Value:{' '}
                      {parsedResult.extraction.declaredValueZar
                        ? `R${parsedResult.extraction.declaredValueZar.toLocaleString()}`
                        : ' '}
                    </span>
                    <span>
                      Product Type:{' '}
                      {parsedResult.extraction.productType || ' '}
                    </span>
                    <span>
                      Confidence:{' '}
                      {parsedResult.extraction.confidence || ' '}
                    </span>
                    {parsedResult.report && (
                      <>
                        <span className="col-span-2 font-medium text-on-surface">
                          Status: {parsedResult.report.overallStatus}
                        </span>
                        <span className="col-span-2">
                          Exposure: R
                          {parsedResult.report.totalExposureZar?.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            {parsingState === 'held' && parsedResult && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-risk-red font-medium">
                  <X className="w-4 h-4" />
                  Held &mdash; compliance review required
                </div>
                {parsedResult.report && (
                  <div className="text-xs text-on-surface-variant bg-risk-red/10 rounded p-3">
                    Exposure: R
                    {parsedResult.report.totalExposureZar?.toLocaleString()}
                    &nbsp;&mdash; {parsedResult.report.results?.length ?? 0}{' '}
                    findings
                  </div>
                )}
              </div>
            )}
            {parsingState === 'warn' && parsedResult && (
              <div className="text-sm text-primary-container">
                Could not read this document clearly enough for a full
                compliance check. Key fields are missing or unclear. Please
                review manually.
              </div>
            )}
            {parsingState === 'configured' && (
              <div className="text-sm text-primary-container">
                AI parsing is not configured. Add a Gemini API key to enable
                document extraction.
              </div>
            )}
            {parsingState === 'error' && (
              <div className="text-sm text-risk-red">
                Parsing failed. Please try again with a clearer document.
              </div>
            )}
          </div>
        )}

        {/* Demo toggle */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setUseDemo(true)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-full transition-colors border',
              useDemo
                ? 'bg-primary-container text-white border-primary-container'
                : 'bg-surface-container-highest text-on-surface-variant border-outline-variant hover:bg-surface-container-high',
            )}
          >
            Try a sample (demo)
          </button>
          {!useDemo && (
            <button
              onClick={() => {
                setUseDemo(true);
                setDemoShipments(SAMPLE_SHIPMENTS);
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-full bg-surface-container-highest text-on-surface-variant border border-outline-variant hover:bg-surface-container-high transition-colors"
            >
              Reset demo data
            </button>
          )}
        </div>

        {/* Queue table */}
        <div
          className="bg-surface-container-lowest rounded-md border border-outline-variant mb-4 overflow-hidden shadow-sm"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-outline-variant p-4 md:flex-row md:items-center">
            <div className="flex flex-wrap gap-1">
              {ALL_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-t transition-colors',
                    activeTab === tab
                      ? 'text-primary-container border-b-2 border-primary-container'
                      : 'text-on-surface-variant hover:text-on-surface',
                  )}
                >
                  {tab} (
                  {demoShipments.filter(
                    (s) => activeTab === 'All' || s.status === activeTab,
                  ).length}
                  )
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search reference or shipper..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded border border-outline-variant bg-surface-container-lowest py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
            <input
              type="text"
              placeholder="Filter importer..."
              value={importer}
              onChange={(e) => setImporter(e.target.value)}
              className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container md:w-48"
            />
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div
                className={cn(
                  COLS,
                  'bg-surface-container px-4 py-2 text-xs font-semibold uppercase text-on-surface-variant',
                )}
              >
                <div>Risk</div>
                <div>Reference</div>
                <div>Shipper</div>
                <div>Consignee</div>
                <div>Route</div>
                <div>Type</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              {filtered.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-on-surface-variant">
                  No shipments match the current filters. Upload a document or
                  reset the filters to see sample shipments.
                </div>
              ) : (
                filtered.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    className="block w-full border-t border-outline-variant text-left transition-colors hover:bg-surface-container-highest"
                    onClick={() => setSelectedShipment(row)}
                  >
                    <div className={cn(COLS, 'px-4 py-3 text-sm')}>
                  <div className="flex items-center">
                    <div
                      className={cn(
                        'w-3.5 h-3.5 rounded-full',
                        riskDotClass(row.risk),
                      )}
                    />
                  </div>
                  <div className="font-medium text-on-surface flex items-center gap-2">
                    {row.reference}
                    <span className="text-[10px] uppercase tracking-wide border border-outline-variant text-on-surface-variant rounded px-1 py-0.5">
                      Sample data
                    </span>
                  </div>
                  <div className="text-on-surface">{row.shipper}</div>
                  <div className="text-on-surface">{row.consignee}</div>
                  <div className="text-on-surface font-[var(--font-mono)]">
                    {row.route}
                  </div>
                  <div className="text-on-surface">{row.type}</div>
                  <div>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        statusBadge(row.status),
                      )}
                    >
                      {row.status}
                    </span>
                  </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded p-1 text-on-surface-variant">
                          <Eye className="h-4 w-4" />
                        </span>
                        <span className="rounded p-1 text-success">
                          <Check className="h-4 w-4" />
                        </span>
                        <span className="rounded p-1 text-risk-red">
                          <X className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {selectedShipment && (
          <div className="fixed inset-0 z-[60] flex items-end bg-black/40 lg:items-center lg:justify-center" onClick={() => setSelectedShipment(null)}>
            <div className="w-full rounded-t-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-xl lg:max-w-2xl lg:rounded-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Shipment detail</p>
                  <h2 className="text-lg font-semibold text-on-surface">{selectedShipment.reference}</h2>
                </div>
                <button type="button" className="rounded-full p-2 hover:bg-surface-container-high" onClick={() => setSelectedShipment(null)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-on-surface-variant sm:grid-cols-2">
                <div className="rounded-lg border border-outline-variant p-3">
                  <p className="text-xs uppercase tracking-wide">Shipper</p>
                  <p className="mt-1 font-medium text-on-surface">{selectedShipment.shipper}</p>
                </div>
                <div className="rounded-lg border border-outline-variant p-3">
                  <p className="text-xs uppercase tracking-wide">Consignee</p>
                  <p className="mt-1 font-medium text-on-surface">{selectedShipment.consignee}</p>
                </div>
                <div className="rounded-lg border border-outline-variant p-3">
                  <p className="text-xs uppercase tracking-wide">Route</p>
                  <p className="mt-1 font-medium text-on-surface">{selectedShipment.route}</p>
                </div>
                <div className="rounded-lg border border-outline-variant p-3">
                  <p className="text-xs uppercase tracking-wide">Status</p>
                  <p className="mt-1 font-medium text-on-surface">{selectedShipment.status}</p>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm text-on-surface-variant">
                This sample detail panel is a mobile-friendly fallback for the queue view. Upload or connect a live document to see the real shipment record here.
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-on-surface-variant">
          Tip: you can also drag and drop a customs document onto the queue
          area to run an AI compliance check.
        </p>
      </div>
    </div>
  );
}
