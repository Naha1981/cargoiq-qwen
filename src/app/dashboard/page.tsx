import Link from "next/link";
import { ArrowRight, AlertTriangle, CheckCircle2, Clock3, FileSearch, ShieldCheck, WalletCards } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { redirect } from "next/navigation";

async function ensureTenant() {
  const { userId } = await auth();
  if (!userId) return redirect("/login");
  if (!db) return redirect("/login");

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.clerk_id, userId),
  });

  if (!user) return redirect("/onboarding");
}

const signals = [
  { label: "Recoverable leakage", value: "R 186,420", meta: "12 open findings", tone: "orange" },
  { label: "Compliance exposure", value: "R 42,800", meta: "3 items need review", tone: "red" },
  { label: "Protected value", value: "R 1.84M", meta: "This month", tone: "green" },
];

const activity = [
  { icon: FileSearch, title: "Carrier invoice variance detected", detail: "MSC · INV-28491 · R 18,640", time: "8 min ago", tone: "orange" },
  { icon: ShieldCheck, title: "SARS document check passed", detail: "SAD500 · SHP-10482", time: "31 min ago", tone: "green" },
  { icon: Clock3, title: "Free-time window approaching", detail: "Durban · MSC · 17h remaining", time: "1 hr ago", tone: "red" },
];

export default async function DashboardPage() {
  await ensureTenant();

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
        <header className="mb-8 flex flex-col gap-5 border-b border-[#E2E6EB] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A939F]">CARGOIQ / OPERATIONS</p>
            <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.035em] text-[#111827]">Freight operations at a glance.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#667085]">Find leakage, resolve compliance exposure, and protect margin before the money leaves.</p>
          </div>
          <Link href="/shadow-audit" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#F97316] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#EA580C]">
            Run an audit <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <section aria-label="Priority signals" className="grid gap-px overflow-hidden rounded-lg border border-[#E2E6EB] bg-[#E2E6EB] md:grid-cols-3">
          {signals.map((signal) => (
            <div key={signal.label} className="bg-white px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-medium text-[#667085]">{signal.label}</p>
                <span className={`h-2 w-2 rounded-full ${signal.tone === "red" ? "bg-[#DC2626]" : signal.tone === "green" ? "bg-[#059669]" : "bg-[#F97316]"}`} />
              </div>
              <p className="mt-3 font-mono text-[25px] font-semibold tracking-[-0.03em] text-[#111827]">{signal.value}</p>
              <p className="mt-1 text-xs text-[#8A939F]">{signal.meta}</p>
            </div>
          ))}
        </section>

        <section className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,.8fr)]">
          <div className="rounded-lg border border-[#E2E6EB] bg-white">
            <div className="flex items-center justify-between border-b border-[#E2E6EB] px-6 py-5">
              <div>
                <h2 className="text-sm font-semibold text-[#111827]">Recovery pipeline</h2>
                <p className="mt-1 text-xs text-[#8A939F]">Where identified value is sitting right now.</p>
              </div>
              <Link href="/queue" className="text-xs font-semibold text-[#C2410C] hover:text-[#9A3412]">View queue</Link>
            </div>
            <div className="space-y-5 px-6 py-6">
              {[
                ["Detected", "R 186,420", 82, "#F97316"],
                ["Under review", "R 74,900", 45, "#D97706"],
                ["Claimed / recovered", "R 111,520", 61, "#059669"],
              ].map(([label, value, width, color]) => (
                <div key={label as string}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-xs">
                    <span className="font-medium text-[#475467]">{label}</span>
                    <span className="font-mono font-semibold text-[#111827]">{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#EEF1F4]">
                    <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: color as string }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 border-t border-[#E2E6EB]">
              <div className="px-6 py-4"><p className="text-[10px] uppercase tracking-[.12em] text-[#98A2B3]">Findings</p><p className="mt-1 font-mono text-lg font-semibold text-[#111827]">27</p></div>
              <div className="border-l border-[#E2E6EB] px-6 py-4"><p className="text-[10px] uppercase tracking-[.12em] text-[#98A2B3]">Open cases</p><p className="mt-1 font-mono text-lg font-semibold text-[#111827]">12</p></div>
              <div className="border-l border-[#E2E6EB] px-6 py-4"><p className="text-[10px] uppercase tracking-[.12em] text-[#98A2B3]">Recovered</p><p className="mt-1 font-mono text-lg font-semibold text-[#059669]">R 111.5k</p></div>
            </div>
          </div>

          <div className="rounded-lg border border-[#E2E6EB] bg-white">
            <div className="border-b border-[#E2E6EB] px-6 py-5">
              <h2 className="text-sm font-semibold text-[#111827]">Needs attention</h2>
              <p className="mt-1 text-xs text-[#8A939F]">Only the items that require a decision.</p>
            </div>
            <div className="divide-y divide-[#E2E6EB]">
              <Link href="/queue" className="block px-6 py-5 transition hover:bg-[#FAFAFB]">
                <div className="flex gap-3"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#F97316]" /><div><p className="text-sm font-medium text-[#111827]">12 recovery cases are waiting</p><p className="mt-1 text-xs leading-5 text-[#667085]">Review evidence and decide which claims to pursue.</p></div></div>
              </Link>
              <Link href="/sentinel" className="block px-6 py-5 transition hover:bg-[#FAFAFB]">
                <div className="flex gap-3"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" /><div><p className="text-sm font-medium text-[#111827]">3 free-time windows are at risk</p><p className="mt-1 text-xs leading-5 text-[#667085]">Act before storage or detention starts accumulating.</p></div></div>
              </Link>
              <Link href="/portals" className="block px-6 py-5 transition hover:bg-[#FAFAFB]">
                <div className="flex gap-3"><WalletCards className="mt-0.5 h-4 w-4 shrink-0 text-[#475467]" /><div><p className="text-sm font-medium text-[#111827]">1 carrier portal needs reconnection</p><p className="mt-1 text-xs leading-5 text-[#667085]">Reconnect to keep automated monitoring active.</p></div></div>
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[#E2E6EB] bg-white">
          <div className="flex items-center justify-between border-b border-[#E2E6EB] px-6 py-5">
            <div><h2 className="text-sm font-semibold text-[#111827]">Latest activity</h2><p className="mt-1 text-xs text-[#8A939F]">Recent events across your freight operations.</p></div>
            <Link href="/inbox" className="text-xs font-semibold text-[#C2410C] hover:text-[#9A3412]">Open inbox</Link>
          </div>
          <div className="divide-y divide-[#E2E6EB]">
            {activity.map((item) => { const Icon = item.icon; return (
              <div key={item.title} className="flex items-center gap-4 px-6 py-4">
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${item.tone === "red" ? "bg-[#FEF2F2] text-[#DC2626]" : item.tone === "green" ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#FFF7ED] text-[#EA580C]"}`}><Icon className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-[#111827]">{item.title}</p><p className="mt-1 truncate text-xs text-[#8A939F]">{item.detail}</p></div>
                <span className="shrink-0 text-xs text-[#98A2B3]">{item.time}</span>
              </div>
            ); })}
          </div>
        </section>

        <footer className="mt-8 flex flex-col gap-2 border-t border-[#E2E6EB] pt-5 text-[10px] uppercase tracking-[0.12em] text-[#98A2B3] sm:flex-row sm:items-center sm:justify-between">
          <span>CARGOIQ · COMPLIANCE · RECOVERY</span>
          <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#059669]" /> Systems operational</span>
        </footer>
      </div>
    </div>
  );
}
