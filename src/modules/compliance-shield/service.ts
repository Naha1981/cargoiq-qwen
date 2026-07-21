import { ShipmentDocumentInput, ComplianceCheckResult, ComplianceReport } from './schema';
import {
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

export async function runAndPersistComplianceShield(
  tenantId: string,
  shipmentId: string,
  doc: ShipmentDocumentInput
): Promise<ComplianceReport> {
  const { results, overallStatus, totalExposureZar } = runComplianceShield(doc);

  for (const result of results) {
    await db.insert(complianceResults).values({
      id: generateId(),
      tenantId,
      shipmentId,
      module: result.module,
      status: result.status,
      message: result.message,
      exposureZar: result.exposureZar.toFixed(2),
    });
  }

  const riskScore = overallStatus === 'hold' ? 5 : overallStatus === 'warn' ? 3 : 1;
  await db.update(shipments)
    .set({ riskScore, status: overallStatus === 'hold' ? 'held' : 'cleared' })
    .where(eq(shipments.id, shipmentId));

  await db.insert(events).values({
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
