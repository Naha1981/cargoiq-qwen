import assert from "node:assert/strict";
import { sha256Buffer, assertPdfBytes, validateInvestigationDocument } from "../src/modules/investigation/storage.ts";
import { detectClaimContradictions } from "../src/modules/investigation/contradictions-core.ts";
import { createSceneToken, verifySceneToken } from "../src/modules/investigation/scene-token.ts";
import { calculateDemurrage } from "../src/modules/investigation/demurrage.ts";
import { moneyToMinor } from "../src/modules/investigation/calculation.ts";

process.env.CARGOiQ_GEV_SCENE_SECRET = "test-secret";

const pdf = Buffer.from("%PDF-1.7\nCargoIQ fixture");
assert.equal(sha256Buffer(pdf), sha256Buffer(Buffer.from("%PDF-1.7\nCargoIQ fixture")));
assert.doesNotThrow(() => assertPdfBytes(pdf));
assert.throws(() => assertPdfBytes(Buffer.from("not pdf")), /INVALID_PDF_SIGNATURE/);
assert.doesNotThrow(() =>
  validateInvestigationDocument({
    fileName: "demurrage.pdf",
    mimeType: "application/pdf",
    size: pdf.length,
  }),
);

const baseClaim = {
  tenantId: "tenant",
  caseId: "case",
  sourceId: "doc",
  documentVersionId: "v1",
  claimText: "Free days: 7",
  normalizedValue: 7,
  valueType: "NUMBER",
  observedAt: null,
  timezone: "UTC",
  confidence: "0.9000",
  provenance: "DERIVED",
  sourceType: "CUSTOMER_PRIMARY",
  locationRef: "page:1",
  sourceQuote: "Free days: 7",
  pageNumber: 1,
  humanReviewed: false,
  createdAt: new Date(),
  id: "claim-a",
  claimType: "FREE_DAYS",
} as any;

const conflicting = {
  ...baseClaim,
  id: "claim-b",
  claimText: "Free days: 5",
  normalizedValue: 5,
  sourceQuote: "Free days: 5",
  pageNumber: 2,
};

const contradictions = detectClaimContradictions([baseClaim, conflicting]);
assert.equal(contradictions.length, 1);
assert.equal(contradictions[0].contradictionType, "CLAIM_VALUE_CONFLICT");
assert.equal(contradictions[0].severity, "HIGH");

const calculation = calculateDemurrage({
  chargeStart: "2026-09-01",
  chargeEnd: "2026-09-07",
  freeDays: 2,
  dailyRateMinor: 185000,
  currency: "ZAR",
  weekendBillable: false,
});
assert.equal(calculation.amountMinor, 555000);
assert.equal(moneyToMinor(1850), 185000);
assert.equal(moneyToMinor("1,850.50"), 185050);
assert.equal(moneyToMinor("R1 850.50"), 185050);

const token = createSceneToken("case-123", "tenant-456", 60);
const verified = verifySceneToken(token);
assert.equal(verified?.caseId, "case-123");
assert.equal(verified?.tenantId, "tenant-456");
assert.equal(verifySceneToken(token + "x"), null);

console.log("CargoIQ investigation vertical checks: PASS");
