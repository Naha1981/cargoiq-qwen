import DashboardShell from '@/components/layout/DashboardShell';

export default function InboxPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-2xl font-bold text-[#0D1B2A] font-sans mb-2">Inbox</h1>
        <p className="text-sm text-[#4A5568] mb-8">AI-flagged emails from carriers, SARS, and importers.</p>

        <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm divide-y divide-[#E2E8F0]">
          {[
            { from: 'Maersk Line', subject: 'Invoice INV-MAEU-2026-1847 — R127,500', time: '2 hours ago', unread: true },
            { from: 'SARS eFiling', subject: 'SAD500 submission confirmed — ZA1234567890', time: '5 hours ago', unread: true },
            { from: 'Durban Container Terminal', subject: 'Free time expiry alert — MSCU1234567', time: 'Yesterday', unread: false },
            { from: 'Zenith Imports', subject: 'RLA reinstatement confirmation', time: 'Yesterday', unread: false },
            { from: 'CMA CGM', subject: 'FSC adjustment notice — June 2026', time: '2 days ago', unread: false },
          ].map((email, i) => (
            <div key={i} className={`flex items-start gap-4 p-4 hover:bg-[#F8FAFC] cursor-pointer ${email.unread ? 'bg-[#FFFBEB]' : ''}`}>
              <div className="mt-1">
                <div className={`w-2 h-2 rounded-full ${email.unread ? 'bg-[#B8860B]' : 'bg-transparent'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium truncate ${email.unread ? 'text-[#0D1B2A]' : 'text-[#4A5568]'}`}>
                    {email.from}
                  </p>
                  <span className="text-xs text-[#94A3B8] whitespace-nowrap ml-4">{email.time}</span>
                </div>
                <p className={`text-sm truncate ${email.unread ? 'text-[#0D1B2A] font-medium' : 'text-[#4A5568]'}`}>
                  {email.subject}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
