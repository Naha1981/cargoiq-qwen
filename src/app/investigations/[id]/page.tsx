"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CaseRecord = {
  id: string;
  title: string;
  reference: string | null;
  disputeType: string;
  status: string;
  baseCurrency: string;
  notes: string | null;
};

type Observation = {
  entityId: string;
  observationType: string;
  observedAt: string | null;
  latitude: string | null;
  longitude: string | null;
  provenance: string;
  confidence: string | null;
  sourceId: string;
  limitation: string | null;
};

export default function InvestigationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { id } = await params;
      try {
        const [caseResponse, geoResponse] = await Promise.all([
          fetch(`/api/v1/investigations/${id}`, { cache: "no-store" }),
          fetch(`/api/v1/investigations/${id}/geospatial`, { cache: "no-store" }),
        ]);
        const caseBody = await caseResponse.json();
        const geoBody = await geoResponse.json();
        if (!caseResponse.ok) throw new Error(caseBody?.message ?? "Could not load the investigation.");
        if (!geoResponse.ok) throw new Error(geoBody?.message ?? "Could not load geospatial evidence.");
        setCaseRecord(caseBody.data);
        setObservations(geoBody.entities ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load the investigation.");
      }
    })();
  }, [params]);

  if (error) {
    return <main className="min-h-screen bg-[#F7F8FA] p-8 text-sm text-[#B42318]">{error}</main>;
  }

  if (!caseRecord) {
    return <main className="min-h-screen bg-[#F7F8FA] p-8 text-sm text-[#667085]">Loading investigation…</main>;
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10">
        <Link href="/investigations" className="text-xs font-semibold text-[#C2410C]">← All investigations</Link>

        <header className="mt-4 border-b border-[#E2E6EB] pb-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A939F]">
                {caseRecord.disputeType.replaceAll("_", " ")} / {caseRecord.baseCurrency}
              </p>
              <h1 className="mt-2 text-[34px] font-semibold tracking-[-0.04em] text-[#111827]">{caseRecord.title}</h1>
            </div>
            <span className="rounded-full border border-[#E2E6EB] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#667085]">
              {caseRecord.status}
            </span>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-lg border border-[#E2E6EB] bg-white">
            <div className="border-b border-[#E2E6EB] px-6 py-5">
              <h2 className="text-sm font-semibold text-[#111827]">Geospatial evidence feed</h2>
              <p className="mt-1 text-xs leading-5 text-[#8A939F]">
                This is the contract consumed by the God’s Eye View investigation surface. No external observation is treated as automatic proof.
              </p>
            </div>

            {observations.length === 0 ? (
              <div className="px-6 py-10 text-sm text-[#667085]">
                No corroborating observations have been attached to this case yet.
              </div>
            ) : (
              <div className="divide-y divide-[#E2E6EB]">
                {observations.map((item) => (
                  <article key={item.entityId} className="px-6 py-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{item.observationType}</p>
                        <p className="mt-1 font-mono text-[11px] text-[#8A939F]">{item.sourceId}</p>
                      </div>
                      <span className="rounded-full border border-[#E2E6EB] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#667085]">
                        {item.provenance}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-[#667085]">
                      {item.latitude && item.longitude ? `${item.latitude}, ${item.longitude}` : "No coordinates"} · {item.observedAt ?? "No observation time"}
                    </p>
                    {item.limitation && <p className="mt-2 text-xs leading-5 text-[#8A939F]">{item.limitation}</p>}
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <section className="rounded-lg border border-[#E2E6EB] bg-white p-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A939F]">Evidence status</p>
              <p className="mt-3 text-2xl font-semibold text-[#111827]">{observations.length}</p>
              <p className="mt-1 text-xs text-[#667085]">external observations attached</p>
            </section>

            <section className="rounded-lg border border-[#E2E6EB] bg-white p-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A939F]">Next</p>
              <p className="mt-2 text-sm font-semibold text-[#111827]">Attach primary evidence</p>
              <p className="mt-1 text-xs leading-5 text-[#667085]">
                The next engineering pass connects immutable documents, extraction, evidence claims, contradictions and the first real demurrage calculation.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
