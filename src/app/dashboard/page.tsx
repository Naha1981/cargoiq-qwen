export default function DashboardPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-[#1A2332] mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 mb-1">Active Risk</div>
          <div className="text-2xl font-mono font-bold text-red-600">R0</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 mb-1">Value Delivered</div>
          <div className="text-2xl font-mono font-bold text-green-600">R0</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 mb-1">Shipments Checked</div>
          <div className="text-2xl font-mono font-bold text-[#1A2332]">0</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 mb-1">ROI Multiple</div>
          <div className="text-2xl font-mono font-bold text-[#B8860B]">0×</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-sm font-semibold text-[#1A2332] mb-4">Getting Started</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-[#B8860B] flex items-center justify-center text-white text-xs">1</div>
            <span className="text-sm">Upload your first document</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">2</div>
            <span className="text-sm text-gray-400">Run a Shadow Audit</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">3</div>
            <span className="text-sm text-gray-400">Connect email inbox</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">4</div>
            <span className="text-sm text-gray-400">Add a carrier rate card</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">5</div>
            <span className="text-sm text-gray-400">Connect your first portal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
