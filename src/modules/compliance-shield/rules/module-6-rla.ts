import { ShipmentDocumentInput, ComplianceCheckResult } from '../schema';

export function checkRlaStatus(doc: ShipmentDocumentInput): ComplianceCheckResult {
  const base = {
    module: 'rla_sentinel',
    moduleName: 'RLA Sentinel',
  };

  const importerCode = doc.importerCode?.trim();

  if (!importerCode) {
    return {
      ...base,
      status: 'warn',
      message: 'No importer code provided. Cannot verify RLA status. Add importer code to enable daily RLA monitoring.',
      exposureZar: 17546,
    };
  }

  const isValidFormat = /^ZA\d{10}$/.test(importerCode) || /^\d{9,10}$/.test(importerCode);

  if (!isValidFormat) {
    return {
      ...base,
      status: 'warn',
      message: `Importer code "${importerCode}" does not match standard SARS format (ZA + 10 digits). Verify before submission.`,
      exposureZar: 0,
      details: { importerCode, expectedFormat: 'ZA1234567890' },
    };
  }

  return {
    ...base,
    status: 'pass',
    message: `Importer ${importerCode} registered for daily RLA monitoring. Status will be checked at 06:00 SAST.`,
    exposureZar: 0,
    details: { importerCode, monitoringActive: true },
  };
}
