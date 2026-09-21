import { and, desc, eq } from "drizzle-orm";
import { jsPDF } from "jspdf";
import { db } from "@/lib/db";
import {
  contradictions,
  evidencePacks,
  externalObservations,
  recoveryAssessments,
} from "@/lib/db/investigation-schema";
import { generateId } from "@/lib/utils";
import { sha256Buffer } from "./storage";
import { getCaseClaims } from "./documents";
import { getInvestigationCase } from "./service";
import { latestCalculation } from "./calculation";

import { nextEvidencePackVersion } from "./hardening";

function addWrapped(doc: jsPDF, text: string, x: number, y: number, maxWidth: number) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * 5;
}

export async function generateEvidencePack(tenantId: string, caseId: string) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");

  const investigation = await getInvestigationCase(tenantId, caseId);
  if (!investigation) throw new Error("NOT_FOUND");

  const claims = await getCaseClaims(tenantId, caseId);
  const contradictionRows = await db
    .select()
    .from(contradictions)
    .where(
      and(
        eq(contradictions.tenantId, tenantId),
        eq(contradictions.caseId, caseId),
      ),
    )
    .orderBy(desc(contradictions.createdAt));

  const observations = await db
    .select()
    .from(externalObservations)
    .where(
      and(
        eq(externalObservations.tenantId, tenantId),
        eq(externalObservations.caseId, caseId),
      ),
    )
    .orderBy(desc(externalObservations.observedAt));

  const calculation = await latestCalculation(tenantId, caseId);
  const [recovery] = await db
    .select()
    .from(recoveryAssessments)
    .where(
      and(
        eq(recoveryAssessments.tenantId, tenantId),
        eq(recoveryAssessments.caseId, caseId),
      ),
    )
    .limit(1);

  const doc = new jsPDF();
  const margin = 16;
  const width = 180;
  let y = 18;

  doc.setFontSize(16);
  doc.text("CargoIQ Investigative Evidence Pack", margin, y);
  y += 8;
  doc.setFontSize(9);
  y = addWrapped(doc, `Case: ${investigation.title}`, margin, y, width);
  y = addWrapped(doc, `Reference: ${investigation.reference ?? "—"}`, margin, y, width);
  y = addWrapped(doc, `Status: ${investigation.status}`, margin, y, width);
  y = addWrapped(doc, `Generated: ${new Date().toISOString()}`, margin, y, width);
  y += 5;

  doc.setFontSize(12);
  doc.text("Executive evidence summary", margin, y);
  y += 7;
  doc.setFontSize(9);
  y = addWrapped(
    doc,
    "This pack preserves source-linked claims, contradictions, deterministic calculations and external corroboration. Forecasts and independent observations are triage/corroboration inputs, not proof of contractual liability.",
    margin,
    y,
    width,
  );
  y += 5;

  doc.setFontSize(12);
  doc.text("Timeline claims", margin, y);
  y += 7;
  doc.setFontSize(8);
  for (const claim of [...claims].sort((a, b) => (a.observedAt?.getTime() ?? 0) - (b.observedAt?.getTime() ?? 0))) {
    if (y > 275) {
      doc.addPage();
      y = 18;
    }
    y = addWrapped(
      doc,
      `[${claim.provenance}] ${claim.claimType}: ${claim.claimText} | page ${claim.pageNumber ?? "?"} | confidence ${claim.confidence ?? "?"}`,
      margin,
      y,
      width,
    );
    if (claim.sourceQuote) {
      y = addWrapped(doc, `Source quote: "${claim.sourceQuote}"`, margin + 5, y, width - 5);
    }
    y += 2;
  }

  doc.addPage();
  y = 18;
  doc.setFontSize(12);
  doc.text("Contradictions", margin, y);
  y += 7;
  doc.setFontSize(9);
  if (!contradictionRows.length) {
    y = addWrapped(doc, "No contradictions detected by the current deterministic checks.", margin, y, width);
  } else {
    for (const row of contradictionRows) {
      y = addWrapped(doc, `[${row.severity}] ${row.contradictionType}: ${row.explanation}`, margin, y, width);
      y += 3;
    }
  }

  y += 5;
  doc.setFontSize(12);
  doc.text("Deterministic calculation", margin, y);
  y += 7;
  doc.setFontSize(9);
  if (calculation) {
    y = addWrapped(doc, `Formula version: ${calculation.formulaVersion}`, margin, y, width);
    y = addWrapped(doc, `Result: ${JSON.stringify(calculation.result)}`, margin, y, width);
    y = addWrapped(doc, `Input snapshot: ${JSON.stringify(calculation.inputSnapshot)}`, margin, y, width);
  } else {
    y = addWrapped(doc, "No calculation run has been stored.", margin, y, width);
  }

  if (recovery) {
    y += 5;
    doc.setFontSize(12);
    doc.text("Recovery assessment", margin, y);
    y += 7;
    doc.setFontSize(9);
    y = addWrapped(
      doc,
      `Charged: ${recovery.chargedAmountMinor ?? "0"} ${recovery.currency}; calculated: ${recovery.calculatedAmountMinor ?? "—"}; potential recovery: ${recovery.potentialRecoveryAmountMinor ?? "—"}.`,
      margin,
      y,
      width,
    );
  }

  y += 5;
  doc.setFontSize(12);
  doc.text("External corroboration", margin, y);
  y += 7;
  doc.setFontSize(9);
  if (!observations.length) {
    y = addWrapped(doc, "No AIS/Sentinel corroboration attached.", margin, y, width);
  } else {
    for (const observation of observations) {
      y = addWrapped(
        doc,
        `${observation.observationType} | ${observation.observedAt?.toISOString() ?? "unknown time"} | ${observation.latitude ?? "?"}, ${observation.longitude ?? "?"} | provenance=${observation.provenance}`,
        margin,
        y,
        width,
      );
      y = addWrapped(doc, `Limitation: ${observation.limitation ?? "source limitation not recorded"}`, margin + 5, y, width - 5);
      y += 2;
      if (y > 275) {
        doc.addPage();
        y = 18;
      }
    }
  }

  y += 6;
  doc.setFontSize(7);
  addWrapped(
    doc,
    "CargoIQ truth rule: source-linked evidence remains distinguishable from derived and inferred outputs. Human approval is required before a material claim is promoted to VERIFIED or an external dispute action is taken.",
    margin,
    y,
    width,
  );

  const contentBytes = Buffer.from(doc.output("arraybuffer"));
  const contentHash = sha256Buffer(contentBytes);

  const existingPacks = await db
    .select({ version: evidencePacks.version })
    .from(evidencePacks)
    .where(and(
      eq(evidencePacks.tenantId, tenantId),
      eq(evidencePacks.caseId, caseId),
    ));
  const version = nextEvidencePackVersion(existingPacks.map((item) => item.version));

  const [created] = await db
    .insert(evidencePacks)
    .values({
      id: generateId(),
      tenantId,
      caseId,
      status: "DRAFT",
      version,
      contentHash,
      storageKey: `db:evidence-pack:${caseId}`,
      contentBytes,
      generatedAt: new Date(),
      createdAt: new Date(),
    })
    .returning();

  return { pack: created, contentBytes, contentHash };
}

export async function latestEvidencePack(tenantId: string, caseId: string) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");
  const [pack] = await db
    .select()
    .from(evidencePacks)
    .where(
      and(
        eq(evidencePacks.tenantId, tenantId),
        eq(evidencePacks.caseId, caseId),
      ),
    )
    .orderBy(desc(evidencePacks.createdAt))
    .limit(1);
  return pack ?? null;
}
