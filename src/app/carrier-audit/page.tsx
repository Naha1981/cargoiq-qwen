'use client';

import { useState, useEffect } from 'react';
import { Upload, Plus, FileText, Trash2, Edit2, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type ParsingState = 'idle' | 'uploading' | 'processing' | 'done' | 'configured' | 'warn' | 'error';

interface RateCard {
  id: string;
  carrier: string;
  chargeType: string;
  route: string;
  mode: string;
  ratePerKg: string | null;
  ratePerContainer: string | null;
  currency: string;
  validFrom: string;
  validTo: string | null;
  createdAt: string;
  updatedAt: string;
}

const demoRateCards: RateCard[] = [
  { id: 'demo-1', carrier: 'Maersk', chargeType: 'Ocean Freight', route: 'Shanghai - Durban', mode: 'per_container', ratePerKg: null, ratePerContainer: '1850', currency: 'USD', validFrom: '2025-01-01', validTo: '2025-12-31', createdAt: '', updatedAt: '' },
  { id: 'demo-2', carrier: 'MSC', chargeType: 'FSC', route: 'Rotterdam - Cape Town', mode: 'per_container', ratePerKg: null, ratePerContainer: '420', currency: 'USD', validFrom: '2025-01-01', validTo: '2025-06-30', createdAt: '', updatedAt: '' },
  { id: 'demo-3', carrier: 'CMA CGM', chargeType: 'Origin THC', route: 'Singapore - Gqeberha', mode: 'per_container', ratePerKg: null, ratePerContainer: '650', currency: 'ZAR', validFrom: '2025-03-01', validTo: '2025-03-31', createdAt: '', updatedAt: '' },
];

const demoAuditItems = [
  { charge: 'Ocean Freight', billed: 18500, rateCard: 17200, variance: 1300, status: 'overcharge' as const },
  { charge: 'FSC', billed: 4200, rateCard: 3800, variance: 400, status: 'overcharge' as const },
  { charge: 'Origin THC', billed: 2100, rateCard: 2100, variance: 0, status: 'ok' as const },
  { charge: 'Destination THC', billed: 3800, rateCard: 3500, variance: 300, status: 'overcharge' as const },
  { charge: 'Documentation', billed: 1200, rateCard: 1200, variance: 0, status: 'ok' as const },
];

const carriers = ['Maersk', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'OOCL'];
const regions = ['Global', 'Africa', 'Asia', 'Europe', 'Americas'];
const modes = ['per_kg', 'per_container', 'per_unit'];

export default function CarrierAuditPage() {
  const [activeTab, setActiveTab] = useState<'rate-cards' | 'upload-audit' | 'fsc-checker'>('rate-cards');
  const [parsingState, setParsingState] = useState<ParsingState>('idle');
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [auditItems, setAuditItems] = useState(demoAuditItems);
  const [useDemo, setUseDemo] = useState(true);
  const [carrierInvoice, setCarrierInvoice] = useState('');
  const [fscBilled, setFscBilled] = useState('');
  const [fscRate, setFscRate] = useState('');
  const [fscRegion, setFscRegion] = useState('Global');

  // Rate Cards state
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [rateCardsLoading, setRateCardsLoading] = useState(false);
  const [showRateCardForm, setShowRateCardForm] = useState(false);
  const [editingRateCard, setEditingRateCard] = useState<RateCard | null>(null);
  const [rateCardForm, setRateCardForm] = useState({
    carrier: '', chargeType: '', route: '', mode: 'per_container',
    ratePerKg: '', ratePerContainer: '', currency: 'USD',
    validFrom: '', validTo: '',
  });

  const totalOvercharge = auditItems.reduce((sum, item) => item.status === 'overcharge' ? sum + item.variance : sum, 0);
  const overchargeItems = auditItems.filter((item) => item.status === 'overcharge');

  useEffect(() => {
    if (activeTab === 'rate-cards') {
      fetchRateCards();
    }
  }, [activeTab]);

  const fetchRateCards = async () => {
    setRateCardsLoading(true);
    try {
      const res = await fetch('/api/v1/rate-cards');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRateCards(data.data || []);
    } catch (err) {
      console.error('[Rate Cards Fetch Error]:', err);
      if (!useDemo) {
        setRateCards([]);
      }
    } finally {
      setRateCardsLoading(false);
    }
  };

  const handleRateCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const existing = editingRateCard;
      const res = await fetch('/api/v1/rate-cards', {
        method: existing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: existing?.id,
          carrier: rateCardForm.carrier,
          chargeType: rateCardForm.chargeType,
          route: rateCardForm.route,
          mode: rateCardForm.mode,
          ratePerKg: rateCardForm.ratePerKg ? parseFloat(rateCardForm.ratePerKg) : undefined,
          ratePerContainer: rateCardForm.ratePerContainer ? parseFloat(rateCardForm.ratePerContainer) : undefined,
          currency: rateCardForm.currency,
          validFrom: rateCardForm.validFrom,
          validTo: rateCardForm.validTo || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setShowRateCardForm(false);
      setEditingRateCard(null);
      setRateCardForm({ carrier: '', chargeType: '', route: '', mode: 'per_container', ratePerKg: '', ratePerContainer: '', currency: 'USD', validFrom: '', validTo: '' });
      await fetchRateCards();
    } catch (err) {
      console.error('[Rate Card Save Error]:', err);
    }
  };

  const handleRateCardEdit = (card: RateCard) => {
    setEditingRateCard(card);
    setRateCardForm({
      carrier: card.carrier,
      chargeType: card.chargeType,
      route: card.route,
      mode: card.mode,
      ratePerKg: card.ratePerKg || '',
      ratePerContainer: card.ratePerContainer || '',
      currency: card.currency,
      validFrom: card.validFrom ? card.validFrom.split('T')[0] : '',
      validTo: card.validTo ? card.validTo.split('T')[0] : '',
    });
    setShowRateCardForm(true);
  };

  const handleRateCardDelete = async (id: string) => {
    if (!confirm('Delete this rate card?')) return;
    try {
      const res = await fetch(`/api/v1/rate-cards?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchRateCards();
    } catch (err) {
      console.error('[Rate Card Delete Error]:', err);
    }
  };

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
      if (data.configured === false) { setParsingState('configured'); return; }
      if (data.error) { setParsingState('error'); return; }
      if (data.couldNotRead) { setParsedResult(data); setParsingState('warn'); return; }
      if (data.report) {
        const { report } = data;
        setParsedResult(data);
setParsingState('done');
        const newItems: { charge: string; billed: number; rateCard: number; variance: number; status: 'overcharge' | 'ok' }[] = [];
        if (report.totalExposureZar && report.totalExposureZar > 0) {
          newItems.push({ charge: 'AI Compliance Finding', billed: report.totalExposureZar, rateCard: 0, variance: report.totalExposureZar, status: 'overcharge' });
        }
        if (report.results) {
          report.results.forEach((r: any) => {
            if (r.status === 'hold' || r.status === 'warn') {
              newItems.push({ charge: r.module, billed: parseFloat(r.exposureZar) || 0, rateCard: 0, variance: parseFloat(r.exposureZar) || 0, status: 'overcharge' });
            } else {
              newItems.push({ charge: r.module, billed: 0, rateCard: 0, variance: 0, status: 'ok' });
            }
          });
        }
        if (newItems.length > 0) {
          setAuditItems((prev) => [...newItems, ...prev]);
        }
      }
    } catch (err) {
      console.error('[Parse Upload Error]:', err);
      setParsingState('error');
    }
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFileUpload(file); };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); };

  const handleFscCheck = () => {
    setParsingState('processing');
    const billed = parseFloat(fscBilled) || 0;
    const rate = parseFloat(fscRate) || 0;
    setParsingState('done');
  };

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
            <div className="flex justify-between items-center">
              <button
                onClick={() => { setEditingRateCard(null); setRateCardForm({ carrier: '', chargeType: '', route: '', mode: 'per_container', ratePerKg: '', ratePerContainer: '', currency: 'USD', validFrom: '', validTo: '' }); setShowRateCardForm(true); }}
                className="inline-flex items-center gap-2 bg-[#D97706] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#B45309] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Rate Card
              </button>
            </div>

            {showRateCardForm && (
              <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 space-y-4">
                <h3 className="text-sm font-semibold text-[#1A2332]">{editingRateCard ? 'Edit Rate Card' : 'New Rate Card'}</h3>
                <form onSubmit={handleRateCardSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Carrier</label>
                      <input type="text" value={rateCardForm.carrier} onChange={(e) => setRateCardForm({ ...rateCardForm, carrier: e.target.value })} required className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Charge Type</label>
                      <input type="text" value={rateCardForm.chargeType} onChange={(e) => setRateCardForm({ ...rateCardForm, chargeType: e.target.value })} required className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Route</label>
                      <input type="text" value={rateCardForm.route} onChange={(e) => setRateCardForm({ ...rateCardForm, route: e.target.value })} required className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Mode</label>
                      <select value={rateCardForm.mode} onChange={(e) => setRateCardForm({ ...rateCardForm, mode: e.target.value })} className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm bg-white">
                        {modes.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                    {rateCardForm.mode === 'per_kg' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Rate per KG (ZAR)</label>
                        <input type="number" step="0.01" value={rateCardForm.ratePerKg} onChange={(e) => setRateCardForm({ ...rateCardForm, ratePerKg: e.target.value })} className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm" />
                      </div>
                    )}
                    {rateCardForm.mode === 'per_container' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Rate per Container (ZAR)</label>
                        <input type="number" step="0.01" value={rateCardForm.ratePerContainer} onChange={(e) => setRateCardForm({ ...rateCardForm, ratePerContainer: e.target.value })} className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm" />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                      <input type="text" value={rateCardForm.currency} onChange={(e) => setRateCardForm({ ...rateCardForm, currency: e.target.value })} maxLength={3} className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Valid From</label>
                      <input type="date" value={rateCardForm.validFrom} onChange={(e) => setRateCardForm({ ...rateCardForm, validFrom: e.target.value })} required className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Valid To (optional)</label>
                      <input type="date" value={rateCardForm.validTo} onChange={(e) => setRateCardForm({ ...rateCardForm, validTo: e.target.value })} className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-[#D97706] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#B45309]">Save</button>
                    <button type="button" onClick={() => { setShowRateCardForm(false); setEditingRateCard(null); }} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {rateCardsLoading ? (
              <div className="text-sm text-gray-500">Loading rate cards...</div>
            ) : rateCards.length === 0 && !useDemo ? (
              <div className="text-sm text-gray-500">No rate cards yet. Add your first one above.</div>
            ) : (
              <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#F1F4F8] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-3">Carrier</th>
                        <th className="px-4 py-3">Charge Type</th>
                        <th className="px-4 py-3">Route</th>
                        <th className="px-4 py-3">Mode</th>
                        <th className="px-4 py-3 text-right">Rate</th>
                        <th className="px-4 py-3">Currency</th>
                        <th className="px-4 py-3">Valid From</th>
                        <th className="px-4 py-3">Valid To</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {(rateCards.length > 0 || useDemo ? rateCards : demoRateCards).map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium">{row.carrier}</td>
                          <td className="px-4 py-3 text-gray-600">{row.chargeType}</td>
                          <td className="px-4 py-3 text-gray-600">{row.route}</td>
                          <td className="px-4 py-3 text-gray-600">{row.mode.replace('_', ' ')}</td>
                          <td className="px-4 py-3 text-right font-mono">{(row.ratePerContainer || row.ratePerKg || '—')}</td>
                          <td className="px-4 py-3">{row.currency}</td>
                          <td className="px-4 py-3 text-gray-500">{row.validFrom ? row.validFrom.split('T')[0] : '—'}</td>
                          <td className="px-4 py-3 text-gray-500">{row.validTo ? row.validTo.split('T')[0] : '—'}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleRateCardEdit(row)} className="p-1 hover:bg-gray-200 rounded" title="Edit"><Edit2 className="h-3.5 w-3.5 text-gray-600" /></button>
                              <button onClick={() => handleRateCardDelete(row.id)} className="p-1 hover:bg-red-100 rounded" title="Delete"><Trash2 className="h-3.5 w-3.5 text-red-600" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'upload-audit' && (
          <div className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={() => {}}
              className="rounded-lg border-2 border-dashed border-[#D97706] bg-amber-50 p-8 text-center cursor-pointer hover:bg-amber-100 transition-colors"
              onClick={() => document.getElementById('audit-file-input')?.click()}
            >
              <Upload className="mx-auto h-10 w-10 text-[#D97706] mb-3" />
              <p className="text-sm font-medium text-[#1A2332] mb-1">Upload invoice or customs document</p>
              <p className="text-xs text-gray-500">PDF, PNG, JPG, or WebP up to 10MB</p>
              <input id="audit-file-input" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" className="hidden" onChange={handleFileSelect} />
            </div>

            {parsingState !== 'idle' && (
              <div className="rounded-lg border p-4">
                {parsingState === 'uploading' && (
                  <div className="flex items-center gap-3 text-sm text-gray-600"><div className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" /> Uploading document...</div>
                )}
                {parsingState === 'processing' && (
                  <div className="flex items-center gap-3 text-sm text-gray-600"><div className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" /> Running AI extraction and compliance checks...</div>
                )}
                {parsingState === 'done' && parsedResult && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-green-700 font-medium"><FileText className="w-4 h-4" /> Document parsed and audit complete</div>
                    {parsedResult.report && (
                      <div className="text-xs text-gray-600 bg-green-50 rounded p-3">
                        Status: {parsedResult.report.overallStatus} | Exposure: R{parsedResult.report.totalExposureZar?.toLocaleString()} | Findings: {parsedResult.report.results?.length ?? 0}
                      </div>
                    )}
                    {parsedResult.extraction && (
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-green-50 rounded p-3">
                        <span>HS Code: {parsedResult.extraction.hsCode || '—'}</span>
                        <span>Declared Value: {parsedResult.extraction.declaredValueZar ? `R${parsedResult.extraction.declaredValueZar.toLocaleString()}` : '—'}</span>
                        <span>Product Type: {parsedResult.extraction.productType || '—'}</span>
                        <span>Confidence: {parsedResult.extraction.confidence || '—'}</span>
                      </div>
                    )}
                  </div>
                )}
                {parsingState === 'configured' && (
                  <div className="text-sm text-amber-700">AI parsing is not configured. Add a Gemini API key to enable document extraction.</div>
                )}
                {parsingState === 'warn' && parsedResult && (
                  <div className="text-sm text-amber-700">Could not read this document clearly enough for a full audit. Please review manually.</div>
                )}
                {parsingState === 'error' && (
                  <div className="text-sm text-red-700">Parsing failed. Please try again with a clearer document.</div>
                )}
              </div>
            )}

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
                        <td className={cn('px-4 py-3 text-right font-mono', row.status === 'overcharge' ? 'text-red-600' : 'text-green-600')}>
                          {row.status === 'overcharge' ? '+' : ''}{row.variance.toLocaleString('en-ZA')}
                        </td>
                        <td className="px-4 py-3">
                          {row.status === 'overcharge' ? (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Overcharge</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">OK</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {row.status === 'overcharge' && (
                            <button className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1 text-xs font-medium hover:bg-gray-100 transition-colors">
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

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setUseDemo(true); setAuditItems(demoAuditItems); setParsedResult(null); setParsingState('idle'); }}
                className={cn('px-3 py-1.5 text-xs font-medium rounded-full transition-colors', useDemo ? 'bg-[#B8860B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
              >
                Try a sample audit (demo data)
              </button>
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
                        <input type="radio" name="region" value={r} className="accent-[#B8860B]" checked={fscRegion === r} onChange={() => setFscRegion(r)} />
                        {r}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={handleFscCheck}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#D97706] text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-[#B45309] transition-colors"
              >
                <FileText className="h-4 w-4" />
                Calculate FSC
              </button>
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
              <button className="w-full inline-flex items-center justify-center gap-2 bg-[#D97706] text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-[#B45309] transition-colors">
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
