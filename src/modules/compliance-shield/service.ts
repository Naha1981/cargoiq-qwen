import { ShipmentDocumentInput, ComplianceCheckResult, ComplianceReport } from './schema';import {
  checkInvoicePackingCrossReference,
  checkHsCode,
  checkVatEngine,
  checkDa65,
  checkDa179,
  checkRlaStatus,
  checkTmsPreDeclaration,
} from './rules';
import { db } from '@/lib/db';
import { complianceResults, shipments, events } from '@/lib/db/schema';
import { generateId } from '@/lib/utils';
import { eq } from 'drizzle-orm';

export function runComplianceShield(doc: ShipmentDocumentInput): {
  results: ComplianceCheckResult[];
  overallStatus: 'pass' | 'warn' | 'hold';
  totalExposureZar: number;
} {
  const results: ComplianceCheckResult[] = [
    checkInvoicePackingCrossReference(doc),
    checkHsCode(doc),
    checkVatEngine(doc),
    checkDa65(doc),
    checkDa179(doc),
    checkRlaStatus(doc),
    checkTmsPreDeclaration(doc),
  ];

  const hasHold = results.some(r => r.status === 'hold');
  const hasWarn = results.some(r => r.status === 'warn');
  const overallStatus = hasHold ? 'hold' : hasWarn ? 'warn' : 'pass';

  const totalExposureZar = results.reduce((sum, r) => sum + r.exposureZar, 0);

  return { results, overallStatus, totalExposureZar };
}

async function insertComplianceResults(tenantId: string, shipmentId: string, results: ComplianceCheckResult[]) {
  for (const result of results) {
    await db!.insert(complianceResults).values({
      id: generateId(),
      tenantId,
      shipmentId,
      module: result.module,
      status: result.status,
      message: result.message,
      exposureZar: result.exposureZar.toFixed(2),
    });
  }
}

async function recordComplianceShieldEvent(
  tenantId: string,
  shipmentId: string,
  overallStatus: 'pass' | 'warn' | 'hold',
  totalExposureZar: number,
  results: ComplianceCheckResult[]
) {
  await db!.insert(events).values({
    id: generateId(),
    tenantId,
    type: 'ComplianceShieldCompleted',
    payload: JSON.stringify({
      shipmentId,
      overallStatus,
      totalExposureZar,
      modulesRun: results.length,
      holds: results.filter(r => r.status === 'hold').length,
      warnings: results.filter(r => r.status === 'warn').length,
    }),
  });
}

/**
 * Run compliance checks against a document AND create a brand-new shipment
 * record for it (used by /api/parse, where no shipment exists yet -- the
 * document IS the source of the shipment). Extracted from src/app/api/parse
 * during Phase 4 (domain module structure); shares its persistence helpers
 * with runAndPersistComplianceShield below rather than duplicating them.
 */
export async function runComplianceShieldForNewShipment(
  tenantId: string,
  extractedFields: { shipmentRef?: string; hsCode?: string; productType?: string; declaredValueZar?: number },
  doc: ShipmentDocumentInput
): Promise<ComplianceReport & { shipmentId: string; riskScore: number }> {
  if (!db) throw new Error('DATABASE_NOT_CONFIGURED');

  const { results, overallStatus, totalExposureZar } = runComplianceShield(doc);
  const shipmentId = generateId();

  await insertComplianceResults(tenantId, shipmentId, results);

  const riskScore = overallStatus === 'hold' ? 5 : overallStatus === 'warn' ? 3 : 1;
  await db.insert(shipments).values({
    id: shipmentId,
    tenantId,
    reference: extractedFields.shipmentRef ?? `PARSED-${Date.now()}`,
    hsCode: extractedFields.hsCode,
    cargoDescription: extractedFields.productType,
    customsValueZar: extractedFields.declaredValueZar,
    riskScore,
    status: overallStatus === 'hold' ? 'held' : overallStatus === 'warn' ? 'review' : 'cleared',
  } as any);

  await recordComplianceShieldEvent(tenantId, shipmentId, overallStatus, totalExposureZar, results);

  return { shipmentId, tenantId, results, overallStatus, totalExposureZar, riskScore, checkedAt: new Date().toISOString() };
}

export async function runAndPersistComplianceShield(
  tenantId: string,
  shipmentId: string,
  doc: ShipmentDocumentInput
): Promise<ComplianceReport> {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");

  const { results, overallStatus, totalExposureZar } = runComplianceShield(doc);

  await insertComplianceResults(tenantId, shipmentId, results);

  const riskScore = overallStatus === 'hold' ? 5 : overallStatus === 'warn' ? 3 : 1;
  await db.update(shipments)
    .set({ riskScore, status: overallStatus === 'hold' ? 'held' : 'cleared' })
    .where(eq(shipments.id, shipmentId));

  await recordComplianceShieldEvent(tenantId, shipmentId, overallStatus, totalExposureZar, results);

  return {
    shipmentId,
    tenantId,
    results,
    overallStatus,
    totalExposureZar,
    checkedAt: new Date().toISOString(),
  };
}

export async function runShadowAudit(
  tenantId: string,
  documents: Array<{ shipmentId: string; doc: ShipmentDocumentInput }>
): Promise<{
  totalShipments: number;
  totalExposureZar: number;
  findings: Array<{ shipmentId: string; report: ComplianceReport }>;
}> {
  const findings: Array<{ shipmentId: string; report: ComplianceReport }> = [];
  let totalExposureZar = 0;

  for (const { shipmentId, doc } of documents) {
    const report = await runAndPersistComplianceShield(tenantId, shipmentId, doc);
    if (report.totalExposureZar > 0) {
      findings.push({ shipmentId, report });
      totalExposureZar += report.totalExposureZar;
    }
  }

  return {
    totalShipments: documents.length,
    totalExposureZar,
    findings,
  };
}

/**
 * Map AI-extracted document fields (from /api/parse's extraction step) into
 * the ShipmentDocumentInput shape this module's checks expect. Moved here
 * from src/app/api/parse/service.ts during Phase 4 -- this is compliance-
 * domain mapping logic, not parse-domain logic.
 */
export function buildComplianceDocument(extracted: {
  invoiceQty?: number;
  packingListQty?: number;
  productType?: string;
  declaredValueZar?: number;
  origin?: 'SACU' | 'non-SACU' | 'unknown';
  hsCode?: string;
  hasDA65?: boolean;
  hasHPL?: boolean;
  truckReg?: string;
  tmsNumber?: string;
  shipmentRef?: string;
}): ShipmentDocumentInput {
  return {
    invoiceItems: extracted.invoiceQty
      ? [{ description: extracted.productType ?? "Goods", quantity: extracted.invoiceQty, unitPrice: (extracted.declaredValueZar ?? 0) / Math.max(extracted.invoiceQty, 1), totalValue: extracted.declaredValueZar ?? 0, hsCode: extracted.hsCode }]
      : undefined,
    packingListItems: extracted.packingListQty
      ? [{ description: extracted.productType ?? "Goods", quantity: extracted.packingListQty }]
      : undefined,
    invoiceTotal: extracted.declaredValueZar,
    currency: "ZAR",
    originCountry: extracted.origin === "SACU" ? "ZA" : extracted.origin === "non-SACU" ? "XX" : undefined,
    destinationCountry: "ZA",
    isSacuOrigin: extracted.origin === "SACU",
    customsValueZar: extracted.declaredValueZar,
    cargoDescription: extracted.productType,
    hsCode: extracted.hsCode,
    hasDa65Stamp: extracted.hasDA65,
    containsSugar: extracted.hasHPL,
    isCrossBorderRoad: !!extracted.truckReg,
    vehicleRegistration: extracted.truckReg,
    isForeignRegistered: !!extracted.truckReg,
    tmsDeclarationNumber: extracted.tmsNumber,
    importerCode: undefined,
    invoiceNumber: extracted.shipmentRef,
  } as ShipmentDocumentInput;
}
