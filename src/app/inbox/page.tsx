import { Logo } from '@/components/ui/logo';

type Priority = 'high' | 'medium' | 'low' | 'none';
type Category = 'Carrier' | 'SARS' | 'Port' | 'Importer';

const categoryStyles: Record<Category, string> = {
  Carrier: 'bg-tertiary/10 text-tertiary border-tertiary/30',
  SARS: 'bg-primary-container/10 text-primary-container border-primary-container/30',
  Port: 'bg-info/10 text-info border-info/30',
  Importer: 'bg-success/10 text-success border-success/30',
};

const priorityStyles: Record<Priority, string> = {
  high: 'bg-risk-red',
  medium: 'bg-warn',
  low: 'bg-info',
  none: 'bg-transparent',
};

interface DemoEmail {
  from: string;
  subject: string;
  time: string;
  unread: boolean;
  category: Category;
  priority: Priority;
}

const DEMO_EMAILS: DemoEmail[] = [
  {
    from: 'Maersk Line',
    subject: 'Invoice INV-MAEU-2026-1847 \u2014 R127,500',
    time: '2 hours ago',
    unread: true,
    category: 'Carrier',
    priority: 'high',
  },
  {
    from: 'SARS eFiling',
    subject: 'SAD500 submission confirmed \u2014 ZA1234567890',
    time: '5 hours ago',
    unread: true,
    category: 'SARS',
    priority: 'medium',
  },
  {
    from: 'Durban Container Terminal',
    subject: 'Free time expiry alert \u2014 MSCU1234567',
    time: 'Yesterday',
    unread: false,
    category: 'Port',
    priority: 'high',
  },
  {
    from: 'Zenith Imports',
    subject: 'RLA reinstatement confirmation',
    time: 'Yesterday',
    unread: false,
    category: 'Importer',
    priority: 'low',
  },
  {
    from: 'CMA CGM',
    subject: 'FSC adjustment notice \u2014 June 2026',
    time: '2 days ago',
    unread: false,
    category: 'Carrier',
    priority: 'medium',
  },
];

export default function InboxPage() {
  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Logo size="sm" />
          <span className="text-on-surface-variant font-normal">/</span>
          <h1 className="text-2xl font-bold text-on-surface font-body-md">
            Inbox
          </h1>
        </div>
        <p className="text-sm text-on-surface-variant mb-6">
          AI-flagged emails from carriers, SARS, and importers. Items are
          ranked by priority so the messages that matter surface first.
        </p>

        {/* Honesty banner */}
        <div className="mb-6 flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-warn" />
          You&rsquo;re viewing sample data. The inbox below shows illustrative
          carrier, SARS, port and importer messages; connect your email source
          in Settings to surface your real correspondence.
        </div>

        {/* Priority legend (the hero of the page) */}
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-3 shadow-sm">
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            Priority key
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-risk-red" />
            <span className="text-xs text-on-surface">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-warn" />
            <span className="text-xs text-on-surface">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-info" />
            <span className="text-xs text-on-surface">Low</span>
          </div>
          <span className="ml-auto text-xs text-on-surface-variant">
            Unread rows are highlighted with the CargoIQ accent.
          </span>
        </div>

        {/* Inbox list */}
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm divide-y divide-outline-variant">
          {DEMO_EMAILS.map((email, i) => (
            <div
              key={i}
              className={`relative flex items-start gap-4 p-4 hover:bg-surface-container-highest cursor-pointer transition-colors ${
                email.unread ? 'bg-primary-container/5' : ''
              }`}
            >
              {/* Ember accent bar on flagged (unread) rows */}
              {email.unread && (
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-full w-1"
                  style={{
                    background:
                      'linear-gradient(180deg,#7E2410 0%,#C83A12 50%,#F2451C 100%)',
                  }}
                />
              )}

              {/* Priority dot (the hero of each row) */}
              <div className="mt-1 flex-shrink-0">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${priorityStyles[email.priority]}`}
                  title={`Priority: ${email.priority}`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <p
                      className={`font-body-md truncate ${
                        email.unread
                          ? 'text-on-surface font-semibold'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      {email.from}
                    </p>
                    <span
                      className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${categoryStyles[email.category]}`}
                    >
                      {email.category}
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps text-on-surface-variant whitespace-nowrap ml-4">
                    {email.time}
                  </span>
                </div>
                <p
                  className={`text-sm truncate mt-0.5 ${
                    email.unread
                      ? 'text-on-surface font-medium'
                      : 'text-on-surface-variant'
                  }`}
                >
                  {email.subject}
                </p>
              </div>

              {email.unread && (
                <span className="mt-1 text-[10px] uppercase tracking-wide border border-outline-variant text-on-surface-variant rounded px-1 py-0.5 flex-shrink-0">
                  Sample data
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-on-surface-variant">
          Tip: clicking a row will open the full message once your email source
          is connected in Settings.
        </p>
      </div>
    </div>
  );
}
