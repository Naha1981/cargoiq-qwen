import assert from "node:assert/strict";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../src/lib/db/index.ts";
import {
  calculationRuns,
  evidenceClaims,
  evidencePacks,
  externalObservations,
  investigationDocuments,
  investigationCases,
} from "../src/lib/db/investigation-schema.ts";

if (!db) {
  console.log("CargoIQ investigation integration checks: SKIP (DATABASE_URL not configured)");
  process.exit(0);
}

const suffix = Date.now().toString();
const tenantA = "p0-a-" + suffix;
const tenantB = "p0-b-" + suffix;
const caseA = "p0-case-a-" + suffix;
const caseB = "p0-case-b-" + suffix;

try {
  await db.insert(investigationCases).values([
    {
      id: caseA, tenantId: tenantA, title: "P0 tenant A case", reference: null,
      disputeType: "DEMURRAGE", status: "OPEN", baseCurrency: "ZAR",
      notes: null, originType: null, originId: null, createdAt: new Date(), updatedAt: new Date(),
    },
    {
      id: caseB, tenantId: tenantB, title: "P0 tenant B case", reference: null,
      disputeType: "DEMURRAGE", status: "OPEN", baseCurrency: "ZAR",
      notes: null, originType: null, originId: null, createdAt: new Date(), updatedAt: new Date(),
    },
  ]);

  await db.insert(investigationDocuments).values([
    {
      id: "p0-doc-a-" + suffix, tenantId: tenantA, caseId: caseA, fileName: "a.pdf",
      mimeType: "application/pdf", sha256: "a".repeat(64), documentType: "DEMURRAGE_DOCUMENT",
      sourceLabel: "integration-test", originalStorageKey: "db:a",
      sizeBytes: 10, contentBytes: Buffer.from("%PDF-a"), immutable: true,
      malwareScanStatus: "CLEAN", createdAt: new Date(),
    },
    {
      id: "p0-doc-b-" + suffix, tenantId: tenantB, caseId: caseB, fileName: "b.pdf",
      mimeType: "application/pdf", sha256: "b".repeat(64), documentType: "DEMURRAGE_DOCUMENT",
      sourceLabel: "integration-test", originalStorageKey: "db:b",
      sizeBytes: 10, contentBytes: Buffer.from("%PDF-b"), immutable: true,
      malwareScanStatus: "CLEAN", createdAt: new Date(),
    },
  ]);

  await db.insert(evidenceClaims).values([
    {
      id: "p0-claim-a-" + suffix, tenantId: tenantA, caseId: caseA, sourceId: "source-a",
      claimType: "CONTAINER_ID", claimText: "A", observedAt: null, timezone: "UTC",
      confidence: "0.9000", provenance: "DERIVED", sourceType: "CUSTOMER_PRIMARY",
      locationRef: "page:1", sourceQuote: "A", pageNumber: 1, normalizedValue: "A",
      documentVersionId: null, humanReviewed: false, createdAt: new Date(),
    },
    {
      id: "p0-claim-b-" + suffix, tenantId: tenantB, caseId: caseB, sourceId: "source-b",
      claimType: "CONTAINER_ID", claimText: "B", observedAt: null, timezone: "UTC",
      confidence: "0.9000", provenance: "DERIVED", sourceType: "CUSTOMER_PRIMARY",
      locationRef: "page:1", sourceQuote: "B", pageNumber: 1, normalizedValue: "B",
      documentVersionId: null, humanReviewed: false, createdAt: new Date(),
    },
  ]);

  await db.insert(externalObservations).values([
    {
      id: "p0-obs-a-" + suffix, tenantId: tenantA, caseId: caseA, sourceId: "source-a",
      observationType: "AIS_POSITION", observedAt: new Date(), retrievedAt: new Date(),
      latitude: "0", longitude: "0", provenance: "INDEPENDENT_OBSERVATION",
      confidence: "0.8000", payload: { tenant: "A" }, limitation: "integration test",
      createdAt: new Date(),
    },
    {
      id: "p0-obs-b-" + suffix, tenantId: tenantB, caseId: caseB, sourceId: "source-b",
      observationType: "AIS_POSITION", observedAt: new Date(), retrievedAt: new Date(),
      latitude: "0", longitude: "0", provenance: "INDEPENDENT_OBSERVATION",
      confidence: "0.8000", payload: { tenant: "B" }, limitation: "integration test",
      createdAt: new Date(),
    },
  ]);

  await db.insert(calculationRuns).values([
    {
      id: "p0-calc-a-" + suffix, tenantId: tenantA, caseId: caseA, ruleId: null,
      ruleVersion: null, formulaVersion: "integration", inputClaimIds: [],
      inputSnapshot: {}, result: { amountMinor: 10 }, assumptions: [], createdAt: new Date(),
    },
    {
      id: "p0-calc-b-" + suffix, tenantId: tenantB, caseId: caseB, ruleId: null,
      ruleVersion: null, formulaVersion: "integration", inputClaimIds: [],
      inputSnapshot: {}, result: { amountMinor: 20 }, assumptions: [], createdAt: new Date(),
    },
  ]);

  await db.insert(evidencePacks).values([
    {
      id: "p0-pack-a-" + suffix, tenantId: tenantA, caseId: caseA, status: "DRAFT",
      version: "1", contentHash: "a".repeat(64), storageKey: "db:a",
      contentBytes: Buffer.from("A"), generatedAt: new Date(), createdAt: new Date(),
    },
    {
      id: "p0-pack-b-" + suffix, tenantId: tenantB, caseId: caseB, status: "DRAFT",
      version: "1", contentHash: "b".repeat(64), storageKey: "db:b",
      contentBytes: Buffer.from("B"), generatedAt: new Date(), createdAt: new Date(),
    },
  ]);

  const ownCase = await db.select({ id: investigationCases.id }).from(investigationCases)
    .where(and(eq(investigationCases.tenantId, tenantA), eq(investigationCases.id, caseA)));
  const foreignCase = await db.select({ id: investigationCases.id }).from(investigationCases)
    .where(and(eq(investigationCases.tenantId, tenantA), eq(investigationCases.id, caseB)));
  assert.equal(ownCase.length, 1);
  assert.equal(foreignCase.length, 0);

  const ownDocuments = await db.select({ id: investigationDocuments.id }).from(investigationDocuments)
    .where(and(eq(investigationDocuments.tenantId, tenantA), eq(investigationDocuments.caseId, caseA)));
  const foreignDocuments = await db.select({ id: investigationDocuments.id }).from(investigationDocuments)
    .where(and(eq(investigationDocuments.tenantId, tenantA), eq(investigationDocuments.caseId, caseB)));
  assert.equal(ownDocuments.length, 1);
  assert.equal(foreignDocuments.length, 0);

  const ownClaims = await db.select({ id: evidenceClaims.id }).from(evidenceClaims)
    .where(and(eq(evidenceClaims.tenantId, tenantA), eq(evidenceClaims.caseId, caseA)));
  const foreignClaims = await db.select({ id: evidenceClaims.id }).from(evidenceClaims)
    .where(and(eq(evidenceClaims.tenantId, tenantA), eq(evidenceClaims.caseId, caseB)));
  assert.equal(ownClaims.length, 1);
  assert.equal(foreignClaims.length, 0);

  const ownObservations = await db.select({ id: externalObservations.id }).from(externalObservations)
    .where(and(eq(externalObservations.tenantId, tenantA), eq(externalObservations.caseId, caseA)));
  const foreignObservations = await db.select({ id: externalObservations.id }).from(externalObservations)
    .where(and(eq(externalObservations.tenantId, tenantA), eq(externalObservations.caseId, caseB)));
  assert.equal(ownObservations.length, 1);
  assert.equal(foreignObservations.length, 0);

  const ownCalculations = await db.select({ id: calculationRuns.id }).from(calculationRuns)
    .where(and(eq(calculationRuns.tenantId, tenantA), eq(calculationRuns.caseId, caseA)));
  const foreignCalculations = await db.select({ id: calculationRuns.id }).from(calculationRuns)
    .where(and(eq(calculationRuns.tenantId, tenantA), eq(calculationRuns.caseId, caseB)));
  assert.equal(ownCalculations.length, 1);
  assert.equal(foreignCalculations.length, 0);

  const ownPacks = await db.select({ id: evidencePacks.id }).from(evidencePacks)
    .where(and(eq(evidencePacks.tenantId, tenantA), eq(evidencePacks.caseId, caseA)));
  const foreignPacks = await db.select({ id: evidencePacks.id }).from(evidencePacks)
    .where(and(eq(evidencePacks.tenantId, tenantA), eq(evidencePacks.caseId, caseB)));
  assert.equal(ownPacks.length, 1);
  assert.equal(foreignPacks.length, 0);

  console.log("CargoIQ database tenant-isolation checks: PASS");
} finally {
  await db.delete(evidencePacks).where(inArray(evidencePacks.caseId, [caseA, caseB]));
  await db.delete(calculationRuns).where(inArray(calculationRuns.caseId, [caseA, caseB]));
  await db.delete(externalObservations).where(inArray(externalObservations.caseId, [caseA, caseB]));
  await db.delete(evidenceClaims).where(inArray(evidenceClaims.caseId, [caseA, caseB]));
  await db.delete(investigationDocuments).where(inArray(investigationDocuments.caseId, [caseA, caseB]));
  await db.delete(investigationCases).where(inArray(investigationCases.id, [caseA, caseB]));
}
