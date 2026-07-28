import { CheckCircle2, Circle, ChevronRight, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
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

export default async function DashboardPage() {
  await ensureTenant();

  return (
    <div className="mx-auto max-w-7xl px-margin-page py-8">
      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-4">Dashboard</h1>

      <div className="border-technical p-4 bg-surface-container-low mb-gutter">
        <p className="font-body-md text-on-surface">
          <strong>You&apos;re viewing sample data.</strong> Connect a portal or upload a document to see real numbers.
        </p>
        <div className="mt-3">
          <Link
            href="/portals"
            className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2 text-sm font-bold hover:opacity-90 transition-colors"
          >
            <Globe className="h-4 w-4" />
            Connect a portal
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-gutter mb-gutter">
        <div className="border-technical p-5 bg-surface-container-low hover-gold transition-colors">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">Shipments Processed</p>
          <div className="flex items-baseline justify-between">
            <span className="font-data-tabular text-[28px] text-on-surface">142</span>
            <span className="text-xs text-primary flex items-center font-bold">
              <span className="material-symbols-outlined text-sm">trending_up</span> 23%
            </span>
          </div>
          <div className="mt-4 h-8 w-full overflow-hidden">
            <svg className="w-full h-full stroke-primary fill-none stroke-2" viewBox="0 0 100 20">
              <polyline className="sparkline" points="0,15 10,12 20,18 30,10 40,8 50,14 60,10 70,12 80,5 90,7 100,2"></polyline>
            </svg>
          </div>
        </div>
        <div className="border-technical p-5 bg-surface-container-low hover-gold transition-colors">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">Automation Rate</p>
          <div className="flex items-baseline justify-between">
            <span className="font-data-tabular text-[28px] text-on-surface">87.4%</span>
            <span className="text-xs text-on-surface-variant flex items-center">
              <span className="material-symbols-outlined text-sm">image_arrow_up</span> 0.2%
            </span>
          </div>
          <div className="mt-4 h-8 w-full overflow-hidden">
            <svg className="w-full h-full stroke-on-surface-variant/40 fill-none stroke-2" viewBox="0 0 100 20">
              <polyline className="sparkline" points="0,10 10,10 20,11 30,9 40,10 50,10 60,10 70,10 80,10 90,10 100,10"></polyline>
            </svg>
          </div>
        </div>
        <div className="border-technical p-5 bg-surface-container-low hover-gold transition-colors">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">Total Value Protected</p>
          <div className="flex items-baseline justify-between">
            <span className="font-data-tabular text-[28px] text-on-surface">R1 842 500</span>
            <span className="text-xs text-primary flex items-center font-bold">
              <span className="material-symbols-outlined text-sm">trending_up</span> 12%
            </span>
          </div>
          <div className="mt-4 h-8 w-full overflow-hidden">
            <svg className="w-full h-full stroke-primary fill-none stroke-2" viewBox="0 0 100 20">
              <polyline className="sparkline" points="0,18 20,14 40,15 60,10 80,5 100,2"></polyline>
            </svg>
          </div>
        </div>
        <div className="border-technical p-5 bg-surface-container-low hover-gold transition-colors">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">Compliance Pass Rate</p>
          <div className="flex items-baseline justify-between">
            <span className="font-data-tabular text-[28px] text-on-surface">96.2%</span>
            <span className="text-xs text-risk-red flex items-center font-bold">
              <span className="material-symbols-outlined text-sm">trending_down</span> 1.4%
            </span>
          </div>
          <div className="mt-4 h-8 w-full overflow-hidden">
            <svg className="w-full h-full stroke-risk-red fill-none stroke-2" viewBox="0 0 100 20">
              <polyline className="sparkline" points="0,2 20,4 40,3 60,6 80,10 100,12"></polyline>
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-gutter mb-gutter">
        <div className="w-3/5 border-technical bg-surface-container-low p-6 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 z-10">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Volume — last 30 days</h3>
              <p className="font-body-md text-on-surface-variant">Daily cargo throughput monitored across all portals.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-surface-container-high border border-primary/50 text-primary text-xs font-bold rounded">Bar View</button>
              <button className="px-3 py-1 bg-transparent border border-outline-variant text-on-surface-variant text-xs rounded hover:border-primary/30 transition-colors">Line View</button>
            </div>
          </div>
          <div className="flex-1 flex items-end gap-1.5 pb-8 relative z-10">
            {volumeData.map((h, i) => (
              <div key={i} className="flex-1 bg-primary/20 hover:bg-primary transition-colors h-[40%] rounded-t-sm group relative">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded text-[10px] hidden group-hover:block whitespace-nowrap">May 01: 42</div>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none opacity-10">
            <div className="border-t border-on-surface w-full"></div>
            <div className="border-t border-on-surface w-full"></div>
            <div className="border-t border-on-surface w-full"></div>
            <div className="border-t border-on-surface w-full"></div>
            <div className="border-t border-on-surface w-full"></div>
          </div>
        </div>

        <div className="w-2/5 border-technical bg-surface-container-high p-6 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 border-r border-outline-variant pr-8">
            <h4 className="font-label-caps text-label-caps text-primary mb-1">ROI Summary</h4>
            <p className="text-xs text-on-surface-variant">Calculation based on annual subscription vs recovery value.</p>
          </div>
          <div className="flex items-center gap-12 py-2">
            <div className="text-center">
              <p className="text-[10px] font-label-caps text-on-surface-variant mb-1">PAID</p>
              <p className="font-data-tabular text-xl text-on-surface">R24 900</p>
            </div>
            <div className="text-center">
              <span className="material-symbols-outlined text-on-surface-variant/40">arrow_forward</span>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-label-caps text-on-surface-variant mb-1">VALUE DELIVERED</p>
              <p className="font-data-tabular text-xl text-on-surface">R1 842 500</p>
            </div>
            <div className="h-10 w-px bg-outline-variant"></div>
            <div className="text-center px-6 py-2 bg-primary/10 border border-primary/20 rounded">
              <p className="text-[10px] font-label-caps text-primary mb-1">ROI MULTIPLE</p>
              <p className="font-data-tabular text-2xl text-primary font-bold">74.0×</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border-technical bg-surface-container-low flex flex-col h-full">
        <div className="p-5 border-b border-outline-variant">
          <h3 className="font-headline-md text-body-lg font-bold text-on-surface">Get the most out of CargoIQ</h3>
          <p className="text-xs text-on-surface-variant mt-1">Unlock 100% compliance automation.</p>
        </div>
        <div className="flex-1 p-5 space-y-6">
          {onboardingItems.map((item, i) => (
            <div key={i} className="group">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-sm bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-sm font-bold">check</span>
                </div>
                <div className="flex-1">
                  <p className="font-body-md text-on-surface font-medium line-through decoration-on-surface-variant">{item.title}</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Primary workspace verified.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 bg-surface-container-high border-t border-outline-variant">
          <div className="flex justify-between items-center mb-2">
            <span className="font-label-caps text-[10px] text-on-surface-variant">SET-UP PROGRESS</span>
            <span className="font-data-tabular text-xs text-primary">20%</span>
          </div>
          <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[20%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}