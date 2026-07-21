export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F1F4F8] flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-4xl font-bold text-[#1A2332]">
          Cargo<span className="text-[#B8860B]">IQ</span>
        </h1>
        <p className="text-lg text-gray-600">
          South Africa&apos;s first AI-powered compliance and cost-containment
          platform for freight forwarders and customs clearing agents.
        </p>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-left">
          <p className="text-sm font-mono text-[#DC2626] mb-2">
            The average SA freight operation leaks:
          </p>
          <p className="text-3xl font-mono font-bold text-[#1A2332]">
            R217,340<span className="text-lg text-gray-400">/month</span>
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <a
            href="/queue"
            className="bg-[#B8860B] text-white px-6 py-3 rounded-md font-medium hover:bg-[#9a7209] transition-colors"
          >
            Calculate My Leakage
          </a>
          <a
            href="/api/health"
            className="border border-[#1A2332] text-[#1A2332] px-6 py-3 rounded-md font-medium hover:bg-[#1A2332] hover:text-white transition-colors"
          >
            API Health Check
          </a>
        </div>
        <p className="text-xs text-gray-400">
          v5.0 · AI-Native Enterprise Architecture · NahaLabs (Pty) Ltd
        </p>
      </div>
    </main>
  );
}
