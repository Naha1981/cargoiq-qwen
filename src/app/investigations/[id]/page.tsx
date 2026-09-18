"use client";

import { useEffect, useMemo, useState } from "react";
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

type ExtractionFact = {
  claimType: string;
  claimText: string;
  value: string | number | boolean;
  pageNumber: number;
  sourceQuote: string;
};

function factValue(facts: ExtractionFact[] | undefined, type: string): string | undefined {
  const item = facts?.find((fact) => fact.claimType === type);
  return item ? String(item.value) : undefined;
}

export default function InvestigationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [facts, setFacts] = useState<ExtractionFact[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { id } = await params;
      setCaseId(id);
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

  const runUpload = async (file: File) => {
    if (!caseId) return;
    setBusy("upload");
    setError(null);
    setMessage(null);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("sourceLabel", "Customer primary demurrage PDF");
      const response = await fetch(`/api/v1/investigations/${caseId}/documents`, {
        method: "POST",
        body: form,
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.message ?? body?.error ?? "Document ingestion failed.");
      setFacts(body?.data?.extraction?.facts ?? []);
      setMessage(
        `Immutable PDF stored. ${body?.data?.claimsCreated ?? 0} evidence claims created and ${body?.data?.contradictionsCreated ?? 0} contradictions detected.`,
      );

      setBusy("calculate");
      const calc = await fetch(`/api/v1/investigations/${caseId}/calculate/demurrage`, {
        method: "POST",
      });
      const calcBody = await calc.json();
      if (!calc.ok) {
        setMessage((prev) => `${prev ?? ""} Calculation: ${calcBody?.message ?? "insufficient evidence"}.`);
      } else {
        setMessage((prev) => `${prev ?? ""} Deterministic calculation stored.`);
      }

      const vesselName = factValue(body?.data?.extraction?.facts, "VESSEL_NAME");
      const start =
        factValue(body?.data?.extraction?.facts, "ARRIVAL_TIME") ??
        factValue(body?.data?.extraction?.facts, "FREE_TIME_START") ??
        factValue(body?.data?.extraction?.facts, "AVAILABLE_TIME");
      const end =
        factValue(body?.data?.extraction?.facts, "RELEASE_TIME") ??
        factValue(body?.data?.extraction?.facts, "FREE_TIME_EXPIRY");

      if (start && end) {
        setBusy("corroborate");
        const corroboration = await fetch(`/api/v1/investigations/${caseId}/corroborate`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            vesselName,
            start: new Date(start).toISOString(),
            end: new Date(end).toISOString(),
            bbox: [30.0, -30.0, 31.2, -29.4],
          }),
        });
        const corroborationBody = await corroboration.json();
        if (corroboration.ok) {
          setMessage(
            (prev) =>
              `${prev ?? ""} Corroboration: AIS ${corroborationBody?.data?.counts?.ais ?? 0}; Sentinel ${corroborationBody?.data?.counts?.sentinel ?? 0}.`,
          );
        } else {
          setMessage((prev) => `${prev ?? ""} Corroboration unavailable: ${corroborationBody?.message ?? "source error"}.`);
        }
      }

      setBusy("pack");
      const pack = await fetch(`/api/v1/investigations/${caseId}/evidence-pack`, {
        method: "POST",
      });
      if (pack.ok) {
        setMessage((prev) => `${prev ?? ""} Evidence pack generated.`);
        setBusy(null);
        window.open(`/api/v1/investigations/${caseId}/evidence-pack`, "_blank", "noopener,noreferrer");
      }
      const geo = await fetch(`/api/v1/investigations/${caseId}/geospatial`, { cache: "no-store" });
      const geoBody = await geo.json();
      if (geo.ok) setObservations(geoBody.entities ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Investigation run failed.");
    } finally {
      setBusy(null);
    }
  };

  const openGodsEyeView = async () => {
    if (!caseId) return;
    setBusy("scene");
    setError(null);
    try {
      const response = await fetch(`/api/v1/investigations/${caseId}/scene-token`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.message ?? "Could not create scene token.");
      const baseUrl = process.env.NEXT_PUBLIC_GEV_URL;
      if (!baseUrl) throw new Error("NEXT_PUBLIC_GEV_URL is not configured.");
      const target = new URL(baseUrl);
      target.searchParams.set("cargoiqCase", caseId);
      target.searchParams.set("cargoiqToken", body.token);
      target.searchParams.set("cargoiqApi", window.location.origin);
      window.open(target.toString(), "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open God’s Eye View.");
    } finally {
      setBusy(null);
    }
  };

  const caseLabel = useMemo(() => caseRecord?.disputeType.replaceAll("_", " "), [caseRecord]);

  if (error && !caseRecord) {
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
                {caseLabel} / {caseRecord.baseCurrency}
              </p>
              <h1 className="mt-2 text-[34px] font-semibold tracking-[-0.04em] text-[#111827]">{caseRecord.title}</h1>
              {caseRecord.reference && <p className="mt-2 font-mono text-xs text-[#8A939F]">{caseRecord.reference}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[#E2E6EB] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#667085]">{caseRecord.status}</span>
              <button
                onClick={openGodsEyeView}
                disabled={busy !== null}
                className="rounded-full bg-[#111827] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {busy === "scene" ? "Opening…" : "Open God’s Eye View"}
              </button>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <section className="rounded-lg border border-[#E2E6EB] bg-white p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A939F]">Primary evidence</p>
                  <h2 className="mt-2 text-lg font-semibold text-[#111827]">Run the demurrage investigation</h2>
                  <p className="mt-1 max-w-[680px] text-xs leading-5 text-[#667085]">
                    Upload the actual carrier/terminal demurrage PDF. CargoIQ hashes and stores the original bytes, extracts source-linked facts, checks contradictions, runs deterministic demurrage, seeks AIS/Sentinel corroboration where possible, then generates an evidence pack.
                  </p>
                </div>
                <label className="cursor-pointer rounded-md border border-[#D0D5DD] bg-white px-4 py-2 text-xs font-semibold text-[#111827]">
                  {busy === "upload" ? "Processing…" : "Choose demurrage PDF"}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    disabled={busy !== null}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void runUpload(file);
                    }}
                  />
                </label>
              </div>
              {message && <p className="mt-4 rounded-md border border-[#E2E6EB] bg-[#F8FAFC] px-4 py-3 text-xs leading-5 text-[#475467]">{message}</p>}
              {error && <p className="mt-4 rounded-md border border-[#FECACA] bg-[#FFF7F7] px-4 py-3 text-xs leading-5 text-[#B42318]">{error}</p>}
            </section>

            <section className="rounded-lg border border-[#E2E6EB] bg-white">
              <div className="border-b border-[#E2E6EB] px-6 py-5">
                <h2 className="text-sm font-semibold text-[#111827]">Extracted evidence claims</h2>
                <p className="mt-1 text-xs text-[#8A939F]">Claims remain DERIVED until a human reviewer promotes them to VERIFIED.</p>
              </div>
              {facts.length === 0 ? (
                <div className="px-6 py-10 text-sm text-[#667085]">No new source claims in this browser session yet.</div>
              ) : (
                <div className="divide-y divide-[#E2E6EB]">
                  {facts.map((fact, index) => (
                    <article key={`${fact.claimType}-${index}`} className="px-6 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-[#111827]">{fact.claimType}</p>
                        <span className="font-mono text-[10px] text-[#8A939F]">p.{fact.pageNumber}</span>
                      </div>
                      <p className="mt-2 text-xs text-[#475467]">{fact.claimText}</p>
                      <p className="mt-2 text-[11px] italic leading-5 text-[#8A939F]">“{fact.sourceQuote}”</p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-lg border border-[#E2E6EB] bg-white">
              <div className="border-b border-[#E2E6EB] px-6 py-5">
                <h2 className="text-sm font-semibold text-[#111827]">God’s Eye View evidence feed</h2>
                <p className="mt-1 text-xs leading-5 text-[#8A939F]">AIS and Sentinel observations appear here after corroboration. They are never treated as automatic proof.</p>
              </div>
              {observations.length === 0 ? (
                <div className="px-6 py-10 text-sm text-[#667085]">No corroborating observations attached yet.</div>
              ) : (
                <div className="divide-y divide-[#E2E6EB]">
                  {observations.map((item) => (
                    <article key={item.entityId} className="px-6 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-[#111827]">{item.observationType}</p>
                          <p className="mt-1 font-mono text-[11px] text-[#8A939F]">{item.sourceId}</p>
                        </div>
                        <span className="rounded-full border border-[#E2E6EB] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#667085]">{item.provenance}</span>
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
          </section>

          <aside className="space-y-6">
            <section className="rounded-lg border border-[#E2E6EB] bg-white p-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A939F]">Vertical slice</p>
              <div className="mt-4 space-y-3 text-xs">
                {[
                  ["Forecast", "NEW signal → OPEN investigation"],
                  ["Source", "PDF + SHA-256 immutable original"],
                  ["Extraction", "Source quote + page-linked claims"],
                  ["Contradictions", "Deterministic conflict checks"],
                  ["Money", "Reproducible demurrage calculation"],
                  ["Corroboration", "AIS + Sentinel discovery"],
                  ["Scene", "Signed GEV case payload"],
                  ["Output", "Human-reviewable evidence pack"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <span className="font-semibold text-[#111827]">{label}</span>
                    <span className="text-right text-[#667085]">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-[#E2E6EB] bg-white p-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A939F]">Evidence pack</p>
              <p className="mt-2 text-sm font-semibold text-[#111827]">Latest generated report</p>
              <p className="mt-1 text-xs leading-5 text-[#667085]">The pack contains chronology, source claims, contradictions, calculations, limitations and corroboration.</p>
              <a
                href={`/api/v1/investigations/${caseId ?? ""}/evidence-pack`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-md border border-[#D0D5DD] px-3 py-2 text-xs font-semibold text-[#111827]"
              >
                Open evidence pack
              </a>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
