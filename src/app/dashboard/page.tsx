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
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-bold text-[#0D1B2A] font-sans mb-4">Dashboard</h1>

      <div className="rounded-xl border border-[#B8860B]/30 bg-[#B8860B]/5 p-4 mb-6">
        <p className="text-sm text-[#0D1B2A]">
          <strong>You're viewing sample data.</strong> Connect your first carrier portal or upload a shipment document to see your real numbers.
        </p>
        <div className="mt-3">
          <Link
            href="/portals"
            className="inline-flex items-center gap-2 bg-[#B8860B] text-white px-4 py-2 text-sm font-semibold hover:bg-[#D4922B] transition-colors"
          >
            <Globe className="h-4 w-4" />
            Connect a portal
          </Link>
        </div>
      </div>

        <div className="grid grid-cols-4 gap-5">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wider text-[#4A5568]">
                Shipments Processed
              </p>
              <span className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Sample data</span>
            </div>
            <p className="mt-1 font-mono text-4xl font-semibold text-[#0D1B2A]">142</p>
            <p className="mt-1 text-xs text-green-600">↑ 23% vs last month</p>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wider text-[#4A5568]">
                Automation Rate
              </p>
              <span className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Sample data</span>
            </div>
            <p className="mt-1 font-mono text-4xl font-semibold text-green-600">87.4%</p>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wider text-[#4A5568]">
                Total Value Protected
              </p>
              <span className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Sample data</span>
            </div>
            <p className="mt-1 font-mono text-4xl font-semibold text-green-600">R1,842,500</p>
            <p className="mt-1 text-xs text-[#4A5568]">Compliance + savings</p>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wider text-[#4A5568]">
                Compliance Pass Rate
              </p>
              <span className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Sample data</span>
            </div>
            <p className="mt-1 font-mono text-4xl font-semibold text-green-600">96.2%</p>
            <p className="mt-1 text-xs text-[#4A5568]">Last 30 days</p>
          </div>
        </div>

        <div className="mt-6 flex gap-6">
          <div className="w-3/5 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#0D1B2A]">Volume — last 30 days</h2>
              <span className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Sample data</span>
            </div>
            <div className="flex items-end gap-1.5 h-40">
              {volumeData.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-[#B8860B]"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <div className="w-2/5 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#0D1B2A]">ROI Summary</h2>
              <span className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Sample data</span>
            </div>
            <div className="mt-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#4A5568]">Paid</span>
                <span className="text-sm font-mono text-[#4A5568]">R24,900</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#4A5568]">Value delivered</span>
                <span className="text-sm font-mono text-[#16A34A]">R1,842,500</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#4A5568]">ROI multiple</span>
                <span className="text-sm font-mono text-[#B8860B]">74.0×</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#0D1B2A]">Get the most out of CargoIQ</h2>
          <div className="mt-4 space-y-3">
            {onboardingItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.done ? (
                    <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
                  ) : (
                    <Circle className="h-5 w-5 text-[#CBD5E1]" />
                  )}
                  <span
                    className={cn(
                      "text-sm",
                      item.done ? "text-[#0D1B2A]" : "text-[#94A3B8]"
                    )}
                  >
                    {item.title}
                  </span>
                </div>
                {!item.done && (
                  item.href ? (
                    <Link href={item.href} className="flex items-center gap-1 text-xs font-medium text-[#B8860B] hover:underline">
                      Do this now <ChevronRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span className="text-xs font-medium text-[#94A3B8]">Coming soon</span>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}
