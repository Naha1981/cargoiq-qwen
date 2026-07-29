export default function InboxPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-bold text-on-surface font-body-md mb-2">Inbox</h1>
      <p className="text-sm text-on-surface-variant mb-8">AI-flagged emails from carriers, SARS, and importers.</p>

      <div className="rounded-xl border border-outline-variant bg-surface-container shadow-sm divide-y divide-outline-variant">
        {[
          { from: 'Maersk Line', subject: 'Invoice INV-MAEU-2026-1847 — R127,500', time: '2 hours ago', unread: true },
          { from: 'SARS eFiling', subject: 'SAD500 submission confirmed — ZA1234567890', time: '5 hours ago', unread: true },
          { from: 'Durban Container Terminal', subject: 'Free time expiry alert — MSCU1234567', time: 'Yesterday', unread: false },
          { from: 'Zenith Imports', subject: 'RLA reinstatement confirmation', time: 'Yesterday', unread: false },
          { from: 'CMA CGM', subject: 'FSC adjustment notice — June 2026', time: '2 days ago', unread: false },
        ].map((email, i) => (
          <div key={i} className={`flex items-start gap-4 p-4 hover:bg-surface-container-highest cursor-pointer ${email.unread ? 'bg-primary-container/5' : ''}`}>
            <div className="mt-1">
              <div className={`w-2 h-2 rounded-full ${email.unread ? 'bg-primary-container' : 'bg-transparent'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`font-body-md truncate ${email.unread ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  {email.from}
                </p>
                <span className="font-label-caps text-label-caps text-on-surface-variant whitespace-nowrap ml-4">{email.time}</span>
              </div>
              <p className={`text-sm truncate ${email.unread ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>
                {email.subject}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
