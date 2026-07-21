'use client';

import { useState } from 'react';
import { Upload, Search, Eye, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const riskColor = (score: number) => {
  if (score === 1) return 'bg-gray-400';
  if (score === 2) return 'bg-blue-500';
  if (score === 3) return 'bg-amber-500';
  if (score === 4) return 'bg-red-500';
  return 'bg-red-500 animate-pulse';
};

const statusPill = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'bg-gray-100 text-gray-700';
    case 'Review Required':
      return 'bg-amber-100 text-amber-700';
    case 'Approved':
      return 'bg-green-100 text-green-700';
    case 'In CargoWise':
      return 'bg-blue-100 text-blue-700';
    case 'Failed':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

type Tab = 'All' | 'Pending' | 'Review Required' | 'Approved' | 'In CargoWise';

const shipments = [
  { id: 'CIQ-2026-00247', reference: 'CIQ-2026-00247', shipper: 'Shenzhen Tech Co Ltd', consignee: 'Demo Freight Imports', route: 'CNSHA → ZADUR', type: 'Sea FCL Import', status: 'Pending', risk: 2 },
  { id: 'CIQ-2026-00248', reference: 'CIQ-2026-00248', shipper: 'Guangzhou Electronics Ltd', consignee: 'ABC Trading', route: 'CNGZH → ZAJNB', type: 'Sea LCL Import', status: 'Review Required', risk: 4 },
  { id: 'CIQ-2026-00249', reference: 'CIQ-2026-00249', shipper: 'Shanghai Steel Works', consignee: 'Metal Imports SA', route: 'CNSHA → ZADUR', type: 'Sea FCL Import', status: 'Approved', risk: 1 },
  { id: 'CIQ-2026-00250', reference: 'CIQ-2026-00250', shipper: 'Yiwu Goods Trading', consignee: 'Retail Plus', route: 'CNYIW → ZAHRB', type: 'Sea LCL Import', status: 'Pending', risk: 3 },
  { id: 'CIQ-2026-00251', reference: 'CIQ-2026-00251', shipper: 'Ningbo Port Logistics', consignee: 'Global Freight', route: 'CNNGB → ZADUR', type: 'Sea FCL Import', status: 'In CargoWise', risk: 2 },
  { id: 'CIQ-2026-00252', reference: 'CIQ-2026-00252', shipper: 'Shenzhen Chemicals Ltd', consignee: 'ChemCorp', route: 'CNSZX → ZAJNB', type: 'Sea FCL Import', status: 'Failed', risk: 5 },
  { id: 'CIQ-2026-00253', reference: 'CIQ-2026-00253', shipper: 'Dongguan Manufacturing', consignee: 'Import Direct', route: 'CNDGG → ZAHRB', type: 'Sea LCL Import', status: 'Review Required', risk: 3 },
  { id: 'CIQ-2026-00254', reference: 'CIQ-2026-00254', shipper: 'Foshan Furniture Co', consignee: 'Home Interiors', route: 'CNFOS → ZADUR', type: 'Sea FCL Import', status: 'Approved', risk: 1 },
];

const tabCounts: Record<Tab, number> = {
  All: shipments.length,
  Pending: shipments.filter((s) => s.status === 'Pending').length,
  'Review Required': shipments.filter((s) => s.status === 'Review Required').length,
  Approved: shipments.filter((s) => s.status === 'Approved').length,
  'In CargoWise': shipments.filter((s) => s.status === 'In CargoWise').length,
};

type ModalState = 'idle' | 'uploading' | 'extracting' | 'compliance' | 'done';

export default function QueuePage() {
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [search, setSearch] = useState('');
  const [importer, setImporter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalState, setModalState] = useState<ModalState>('idle');
  const [dragOver, setDragOver] = useState(false);

  const filtered = shipments.filter((s) => {
    if (activeTab !== 'All' && s.status !== activeTab) return false;
    if (search && !s.reference.toLowerCase().includes(search.toLowerCase()) && !s.shipper.toLowerCase().includes(search.toLowerCase())) return false;
    if (importer && !s.consignee.toLowerCase().includes(importer.toLowerCase())) return false;
    return true;
  });

  const handleUpload = () => {
    setShowModal(true);
    setModalState('uploading');
    setTimeout(() => setModalState('extracting'), 1500);
    setTimeout(() => setModalState('compliance'), 3000);
    setTimeout(() => setModalState('done'), 4500);
  };

  const resetModal = () => {
    setShowModal(false);
    setModalState('idle');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#1A2332]">Shipment Queue</h1>
          <button
            onClick={handleUpload}
            className="flex items-center gap-2 bg-[#D97706] hover:bg-[#B45309] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 mb-4">
          <div className="flex items-center gap-4 p-4 border-b border-gray-100">
            <div className="flex gap-1">
              {(Object.keys(tabCounts) as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-t transition-colors',
                    activeTab === tab
                      ? 'text-[#B8860B] border-b-2 border-[#D97706]'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {tab} ({tabCounts[tab]})
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reference or shipper..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 border border-gray-300 rounded text-sm w-64 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <input
              type="text"
              placeholder="Filter importer..."
              value={importer}
              onChange={(e) => setImporter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm w-48 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
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
                  <div className="flex items-center">
                    <div className={cn('w-3.5 h-3.5 rounded-full', riskColor(row.risk))} title={`Risk: ${row.risk}`} />
                  </div>
                  <div className="font-medium text-[#0D1B2A]">{row.reference}</div>
                  <div className="text-gray-700">{row.shipper}</div>
                  <div className="text-gray-700">{row.consignee}</div>
                  <div className="text-gray-700">{row.route}</div>
                  <div className="text-gray-700">{row.type}</div>
                  <div>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusPill(row.status))}>
                      {row.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-200 rounded" title="View">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-green-100 rounded" title="Approve">
                      <Check className="w-4 h-4 text-green-600" />
                    </button>
                    <button className="p-1 hover:bg-red-100 rounded" title="Reject">
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-[#1A2332] mb-1">Upload Document</h2>
            <p className="text-sm text-gray-500 mb-4">Drop your PDF, CSV, or Excel file below</p>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                dragOver ? 'border-[#D97706] bg-amber-50' : 'border-gray-300 bg-gray-50'
              )}
            >
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Drag & drop files here, or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">PDF, CSV, XLSX up to 25MB</p>
            </div>

            <div className="mt-6 text-center">
              {modalState === 'uploading' && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-[#D97706] h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                  <p className="text-sm text-gray-600">Uploading...</p>
                </div>
              )}
              {modalState === 'extracting' && (
                <p className="text-sm text-gray-600">Extracting shipment data...</p>
              )}
              {modalState === 'compliance' && (
                <p className="text-sm text-gray-600">Running Compliance Shield...</p>
              )}
              {modalState === 'done' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">Upload complete</span>
                  </div>
                  <button
                    onClick={resetModal}
                    className="bg-[#D97706] hover:bg-[#B45309] text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

            {modalState === 'idle' && (
              <div className="mt-6 flex justify-end">
                <button onClick={resetModal} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
