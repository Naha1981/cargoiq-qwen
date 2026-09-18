"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Investigation = {
  id: string;
  title: string;
  reference: string | null;
  disputeType: string;
  status: string;
  baseCurrency: string;
  updatedAt: string;
};

const disputeTypes = [
  "DEMURRAGE",
  "DETENTION",
  "STORAGE",
  "WAITING_TIME",
  "ACCESSORIAL",
  "CARRIER_OVERCHARGE",
  "OTHER",
] as const;

export default function InvestigationsPage() {
  const [items, setItems] = useState<Investigation[]>([]);
  const [title, setTitle] = useState("");
  const [disputeType, setDisputeType] = useState<(typeof disputeTypes)[number]>("DEMURRAGE");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/investigations", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.message ?? "Could not load investigations.");
      setItems(body.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load investigations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createCase(event: FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/investigations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, disputeType, baseCurrency: "ZAR" }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.message ?? "Could not create the investigation.");
      setTitle("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the investigation.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10">
        <header className="mb-8 border-b border-[#E2E6EB] pb-7">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A939F]">
            CARGOIQ / INVESTIGATIONS
          </p>
          <h1 className="mt-2 text-[34px] font-semibold tracking-[-0.04em] text-[#111827]">
            Investigate the money.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085]">
            Reconstruct freight events, compare evidence, surface contradictions, and calculate exposure without asking an AI model to invent the answer.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form onSubmit={createCase} className="rounded-lg border border-[#E2E6EB] bg-white p-6">
            <h2 className="text-sm font-semibold text-[#111827]">New investigation</h2>
            <p className="mt-1 text-xs leading-5 text-[#8A939F]">
              Start with the dispute type. Documents and corroboration are attached after the case exists.
            </p>

            <label className="mt-5 block text-xs font-medium text-[#475467]">
              Case title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                minLength={3}
                className="mt-2 w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#F97316]"
                placeholder="MSC Durban demurrage — Aug 2026"
              />
            </label>

            <label className="mt-4 block text-xs font-medium text-[#475467]">
              Dispute type
              <select
                value={disputeType}
                onChange={(event) => setDisputeType(event.target.value as typeof disputeType)}
                className="mt-2 w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#F97316]"
              >
                {disputeTypes.map((type) => (
                  <option key={type} value={type}>{type.replaceAll("_", " ")}</option>
                ))}
              </select>
            </label>

            <button
              disabled={creating || title.trim().length < 3}
              className="mt-5 w-full rounded-md bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "Creating…" : "Create investigation"}
            </button>

            {error && <p className="mt-4 text-xs text-[#B42318]">{error}</p>}
          </form>

          <section className="rounded-lg border border-[#E2E6EB] bg-white">
            <div className="flex items-center justify-between border-b border-[#E2E6EB] px-6 py-5">
              <div>
                <h2 className="text-sm font-semibold text-[#111827]">Cases</h2>
                <p className="mt-1 text-xs text-[#8A939F]">Every case is tenant-scoped.</p>
              </div>
              <span className="font-mono text-xs text-[#667085]">{items.length} total</span>
            </div>

            {loading ? (
              <div className="px-6 py-8 text-sm text-[#667085]">Loading investigations…</div>
            ) : items.length === 0 ? (
              <div className="px-6 py-10 text-sm text-[#667085]">No investigations yet.</div>
            ) : (
              <div className="divide-y divide-[#E2E6EB]">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/investigations/${item.id}`}
                    className="block px-6 py-5 transition hover:bg-[#FAFBFC]"
                  >
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{item.title}</p>
                        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[#8A939F]">
                          {item.disputeType.replaceAll("_", " ")} · {item.baseCurrency}
                        </p>
                      </div>
                      <span className="rounded-full border border-[#E2E6EB] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#667085]">
                        {item.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
