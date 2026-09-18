import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  evidenceClaims,
  investigationAuditEvents,
  investigationDocumentVersions,
  investigationDocuments,
} from "@/lib/db/investigation-schema";
import { generateId } from "@/lib/utils";
import { extractDemurrageEvidenceFromPdf, extractionToClaims } from "./extraction";
import {
  assertPdfBytes,
  sanitizeFileName,
  sha256Buffer,
  validateInvestigationDocument,
} from "./storage";
import { persistClaimContradictions } from "./contradictions";

async function malwareScan(buffer: Buffer) {
  const endpoint = process.env.CLAMAV_URL;
  if (!endpoint) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("MALWARE_SCAN_NOT_CONFIGURED");
    }
    return "NOT_CONFIGURED";
  }

  const response = await fetch(endpoint.replace(/\/$/, "") + "/scan", {
    method: "POST",
    headers: { "content-type": "application/octet-stream" },
    body: buffer,
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`MALWARE_SCAN_${response.status}`);
  const body = (await response.json().catch(() => null)) as { clean?: boolean } | null;
  if (body?.clean !== true) throw new Error("MALWARE_DETECTED");
  return "CLEAN";
}

export async function ingestDemurragePdf(input: {
  tenantId: string;
  caseId: string;
  file: {
    name: string;
    type: string;
    size: number;
    buffer: Buffer;
  };
  sourceLabel?: string;
  documentType?: string;
  actorUserId?: string;
}) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");

  validateInvestigationDocument({
    fileName: input.file.name,
    mimeType: input.file.type,
    size: input.file.size,
  });
  assertPdfBytes(input.file.buffer);

  const sha256 = sha256Buffer(input.file.buffer);
  const [duplicate] = await db
    .select()
    .from(investigationDocuments)
    .where(
      and(
        eq(investigationDocuments.tenantId, input.tenantId),
        eq(investigationDocuments.caseId, input.caseId),
        eq(investigationDocuments.sha256, sha256),
      ),
    )
    .limit(1);

  const now = new Date();
  let document = duplicate ?? null;
  let documentId = duplicate?.id ?? generateId();
  let versionId = generateId();
  let isRetry = false;

  if (duplicate) {
    const [latestVersion] = await db
      .select()
      .from(investigationDocumentVersions)
      .where(
        and(
          eq(investigationDocumentVersions.tenantId, input.tenantId),
          eq(investigationDocumentVersions.documentId, duplicate.id),
        ),
      )
      .orderBy(desc(investigationDocumentVersions.createdAt))
      .limit(1);

    if (latestVersion?.extractionStatus === "COMPLETE") {
      return {
        document: duplicate,
        duplicate: true,
        claimsCreated: 0,
        contradictionsCreated: 0,
      };
    }

    if (latestVersion) {
      await db
        .delete(evidenceClaims)
        .where(
          and(
            eq(evidenceClaims.tenantId, input.tenantId),
            eq(evidenceClaims.caseId, input.caseId),
            eq(evidenceClaims.documentVersionId, latestVersion.id),
          ),
        );
      isRetry = true;
    }
  } else {
    const scanStatus = await malwareScan(input.file.buffer);

    [document] = await db
      .insert(investigationDocuments)
      .values({
        id: documentId,
        tenantId: input.tenantId,
        caseId: input.caseId,
        fileName: sanitizeFileName(input.file.name),
        mimeType: input.file.type,
        sha256,
        documentType: input.documentType ?? "DEMURRAGE_DOCUMENT",
        sourceLabel: input.sourceLabel ?? "Customer primary source",
        originalStorageKey: `db:${documentId}`,
        sizeBytes: input.file.size,
        contentBytes: input.file.buffer,
        immutable: true,
        malwareScanStatus: scanStatus,
        createdAt: now,
      })
      .returning();
  }

  const versionNumber = duplicate
    ? String(Number(
        (
          await db
            .select()
            .from(investigationDocumentVersions)
            .where(
              and(
                eq(investigationDocumentVersions.tenantId, input.tenantId),
                eq(investigationDocumentVersions.documentId, documentId),
              ),
            )
            .orderBy(desc(investigationDocumentVersions.createdAt))
            .limit(1)
        )[0]?.version ?? "0",
      ) + 1)
    : "1";

  const [version] = await db
    .insert(investigationDocumentVersions)
    .values({
      id: versionId,
      tenantId: input.tenantId,
      documentId,
      version: versionNumber,
      extractionStatus: "PROCESSING",
      parser: "gemini-demurrage-evidence",
      parserVersion: "v1",
      pageCount: null,
      extractedText: null,
      extractedPayload: null,
      createdAt: now,
    })
    .returning();

  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey || apiKey === "PASTE_YOUR_GEMINI_KEY_HERE") {
      throw new Error("GOOGLE_GENERATIVE_AI_API_KEY_NOT_CONFIGURED");
    }

    const extraction = await extractDemurrageEvidenceFromPdf(input.file.buffer, apiKey);
    const claims = extractionToClaims(extraction, {
      caseId: input.caseId,
      documentId,
      documentVersionId: versionId,
    });

    const createdClaims = [];
    for (const claim of claims) {
      const [row] = await db
        .insert(evidenceClaims)
        .values({
          id: generateId(),
          tenantId: input.tenantId,
          caseId: claim.caseId,
          sourceId: claim.sourceId,
          documentVersionId: claim.documentVersionId ?? null,
          claimType: claim.claimType,
          claimText: claim.claimText,
          observedAt: claim.observedAt ? new Date(claim.observedAt) : null,
          timezone: claim.timezone ?? null,
          confidence: claim.confidence?.toFixed(4) ?? null,
          provenance: claim.provenance,
          sourceType: claim.sourceType,
          locationRef: claim.locationRef ?? null,
          sourceQuote: claim.sourceQuote ?? null,
          pageNumber: claim.pageNumber ?? null,
          normalizedValue: claim.normalizedValue ?? null,
          humanReviewed: false,
          createdAt: now,
        })
        .returning();
      createdClaims.push(row);
    }

    await db
      .update(investigationDocumentVersions)
      .set({
        extractionStatus: "COMPLETE",
        extractedPayload: extraction,
      })
      .where(eq(investigationDocumentVersions.id, versionId));

    const contradictions = await persistClaimContradictions(input.tenantId, input.caseId);

    await db.insert(investigationAuditEvents).values({
      id: generateId(),
      tenantId: input.tenantId,
      caseId: input.caseId,
      actorUserId: input.actorUserId ?? null,
      action: "DOCUMENT_INGESTED",
      targetType: "investigation_document",
      targetId: documentId,
      payload: {
        sha256,
        versionId,
        claimsCreated: createdClaims.length,
        contradictionsDetected: contradictions.length,
      },
      createdAt: new Date(),
    });

    return {
      document: document!,
      version,
      extraction,
      claims: createdClaims,
      claimsCreated: createdClaims.length,
      contradictionsCreated: contradictions.length,
      duplicate: isRetry,
    };
  } catch (error) {
    await db
      .update(investigationDocumentVersions)
      .set({ extractionStatus: "FAILED" })
      .where(eq(investigationDocumentVersions.id, versionId));
    throw error;
  }
}

export async function listCaseDocuments(tenantId: string, caseId: string) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");
  return db
    .select()
    .from(investigationDocuments)
    .where(
      and(
        eq(investigationDocuments.tenantId, tenantId),
        eq(investigationDocuments.caseId, caseId),
      ),
    )
    .orderBy(desc(investigationDocuments.createdAt));
}

export async function getCaseClaims(tenantId: string, caseId: string) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");
  return db
    .select()
    .from(evidenceClaims)
    .where(
      and(
        eq(evidenceClaims.tenantId, tenantId),
        eq(evidenceClaims.caseId, caseId),
      ),
    )
    .orderBy(desc(evidenceClaims.createdAt));
}
