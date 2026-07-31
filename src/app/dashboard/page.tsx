import { Globe } from "lucide-react";
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function ensureTenant() {
  const { userId } = await auth();
  if (!userId) return redirect('/login');
  if (!db) return redirect('/login');

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.clerk_id, userId),
  });

  if (!user) return redirect('/onboarding');
}

const volumeData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 80) + 20);

const onboardingItems = [
  { title: "Connect your first carrier portal", done: true, href: '/portals' },
  { title: "Upload a shipment document", done: true, href: null },
  { title: "Run your first Shadow Audit", done: false, href: '/shadow-audit' },
  { title: "Review your ROI summary", done: false, href: '/dashboard' },
  { title: "Invite your team", done: false, href: null },
];

function SampleTag() {
  return (
    <span className="rounded-full border border-outline-variant bg-surface-container-low px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
      Sample data
    </span>
  );
}

export default async function DashboardPage() {
  await ensureTenant();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">Dashboard</h1>
        <SampleTag />
      </div>

      {/* Honest sample-data banner — preserved */}
      <div className="mb-6 rounded-xl border border-outline-variant bg-surface-container-low p-4">
        <p className="text-sm text-on-surface">
          <strong>You're viewing sample data.</strong> Connect a portal or upload a document to see real numbers.
        </p>
        <div className="mt-3">
          <Link
            href="/portals"
            className="ember-button inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-95"
          >
            <Globe className="h-4 w-4" />
            Connect a portal
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Shipments Processed</p>
            <SampleTag />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-[var(--font-mono)] text-[28px] text-on-surface">142</span>
            <span className="flex items-center text-xs font-bold text-primary">
              <span className="material-symbols-outlined text-sm">trending_up</span> 23%
            </span>
          </div>
          <div className="mt-4 h-8 w-full overflow-hidden">
            <svg className="h-full w-full fill-none stroke-[#C83A12] stroke-2" viewBox="0 0 100 20">
              <polyline className="sparkline" points="0,15 10,12 20,18 30,10 40,8 50,14 60,10 70,12 80,5 90,7 100,2"></polyline>
            </svg>
          </div>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Automation Rate</p>
            <SampleTag />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-[var(--font-mono)] text-[28px] text-on-surface">87.4%</span>
            <span className="flex items-center text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">image_arrow_up</span> 0.2%
            </span>
          </div>
          <div className="mt-4 h-8 w-full overflow-hidden">
            <svg className="h-full w-full fill-none stroke-on-surface-variant/40 stroke-2" viewBox="0 0 100 20">
              <polyline className="sparkline" points="0,10 10,10 20,11 30,9 40,10 50,10 60,10 70,10 80,10 90,10 100,10"></polyline>
            </svg>
          </div>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Total Value Protected</p>
            <SampleTag />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-[var(--font-mono)] text-[28px] text-on-surface">R1 842 500</span>
            <span className="flex items-center text-xs font-bold text-primary">
              <span className="material-symbols-outlined text-sm">trending_up</span> 12%
            </span>
          </div>
          <div className="mt-4 h-8 w-full overflow-hidden">
            <svg className="h-full w-full fill-none stroke-[#C83A12] stroke-2" viewBox="0 0 100 20">
              <polyline className="sparkline" points="0,18 20,14 40,15 60,10 80,5 100,2"></polyline>
            </svg>
          </div>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Compliance Pass Rate</p>
            <SampleTag />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-[var(--font-mono)] text-[28px] text-on-surface">96.2%</span>
            <span className="flex items-center text-xs font-bold text-error">
              <span className="material-symbols-outlined text-sm">trending_down</span> 1.4%
            </span>
          </div>
          <div className="mt-4 h-8 w-full overflow-hidden">
            <svg className="h-full w-full fill-none stroke-error stroke-2" viewBox="0 0 100 20">
              <polyline className="sparkline" points="0,2 20,4 40,3 60,6 80,10 100,12"></polyline>
            </svg>
          </div>
        </div>
      </div>

      {/* Volume chart + ROI strip */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="relative flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm lg:col-span-3">
          <div className="z-10 mb-8 flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <h3 className="text-lg font-bold text-on-surface">Volume — last 30 days</h3>
                <SampleTag />
              </div>
              <p className="text-sm text-on-surface-variant">Daily cargo throughput monitored across all portals.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="rounded-md border border-primary/50 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Bar View</button>
              <button type="button" className="rounded-md border border-outline-variant bg-transparent px-3 py-1 text-xs text-on-surface-variant transition-colors hover:border-primary/30">Line View</button>
            </div>
          </div>
          <div className="relative z-10 flex flex-1 items-end gap-1.5 pb-8">
            {volumeData.map((h, i) => (
              <div key={i} className="group relative h-[40%] flex-1 rounded-t-sm bg-primary/20 transition-colors hover:bg-primary">
                <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-surface-container-highest px-2 py-1 text-[10px] group-hover:block">May 01: 42</div>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 opacity-10">
            <div className="w-full border-t border-on-surface"></div>
            <div className="w-full border-t border-on-surface"></div>
            <div className="w-full border-t border-on-surface"></div>
            <div className="w-full border-t border-on-surface"></div>
            <div className="w-full border-t border-on-surface"></div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8 rounded-xl border border-outline-variant bg-surface-container-low p-6 shadow-sm md:flex-row lg:col-span-2">
          <div className="flex-1 border-outline-variant pr-0 md:border-r md:pr-8">
            <h4 className="ember-accent mb-1 text-xs font-semibold uppercase tracking-widest text-primary">ROI Summary</h4>
            <p className="text-xs text-on-surface-variant">Calculation based on annual subscription vs recovery value.</p>
          </div>
          <div className="flex items-center gap-8 py-2">
            <div className="text-center">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">PAID</p>
              <p className="font-[var(--font-mono)] text-xl text-on-surface">R24 900</p>
            </div>
            <div className="text-center">
              <span className="material-symbols-outlined text-on-surface-variant/40">arrow_forward</span>
            </div>
            <div className="text-center">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">VALUE DELIVERED</p>
              <p className="font-[var(--font-mono)] text-xl text-on-surface">R1 842 500</p>
            </div>
            <div className="rounded border border-primary/20 bg-primary/10 px-4 py-2 text-center">
              <p className="ember-accent mb-1 text-[10px] font-semibold uppercase tracking-wide text-primary">ROI MULTIPLE</p>
              <p className="ember-accent font-[var(--font-mono)] text-2xl font-bold text-primary">74.0×</p>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding checklist */}
      <div className="flex h-full flex-col rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="border-b border-outline-variant p-5">
          <h3 className="text-lg font-bold text-on-surface">Get the most out of CargoIQ</h3>
          <p className="mt-1 text-xs text-on-surface-variant">Unlock 100% compliance automation.</p>
        </div>
        <div className="flex-1 space-y-6 p-5">
          {onboardingItems.map((item, i) => (
            <div key={i} className="group">
              <div className="flex items-start gap-3">
                <div className="mt-1 grid h-5 w-5 place-items-center rounded-sm bg-primary">
                  <span className="material-symbols-outlined text-sm font-bold text-on-primary">check</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-on-surface line-through decoration-on-surface-variant">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-on-surface-variant">Primary workspace verified.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-outline-variant bg-surface-container-low p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">SET-UP PROGRESS</span>
            <span className="ember-accent font-[var(--font-mono)] text-xs font-bold text-primary">20%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
            <div className="ember-gradient-bar h-full w-[20%] rounded-full bg-[linear-gradient(90deg,#7E2410,#C83A12,#F2451C)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
