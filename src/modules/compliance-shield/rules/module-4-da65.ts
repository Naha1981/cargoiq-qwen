import { ShipmentDocumentInput, ComplianceCheckResult } from '../schema';

export function checkDa65(doc: ShipmentDocumentInput): ComplianceCheckResult {
  const base = {
    module: 'da65_checker',
    moduleName: 'DA65 Temporary Export Checker',
  };

  if (!doc.isTemporaryExport) {
    return {
      ...base,
      status: 'pass',
      message: 'Not flagged as temporary export/re-import. DA65 check not applicable.',
      exposureZar: 0,
    };
  }

  if (doc.hasDa65Stamp) {
    return {
      ...base,
      status: 'pass',
      message: 'DA65 stamp confirmed. Goods will not be taxed as new import on return.',
      exposureZar: 0,
    };
  }

  const customsValue = doc.customsValueZar || 0;
  const potentialDuty = customsValue * 0.20;
  const potentialVat = (customsValue + potentialDuty) * 0.15;
  const totalExposure = potentialDuty + potentialVat;

  return {
    ...base,
    status: 'hold',
    message: `CRITICAL: Goods flagged as temporary export but NO DA65 stamp recorded. On return, SARS will treat these as a NEW IMPORT. Estimated duty + VAT exposure: R${totalExposure.toLocaleString()}.`,
    exposureZar: totalExposure,
    details: {
      isTemporaryExport: true,
      hasDa65Stamp: false,
      customsValue,
      potentialDuty: potentialDuty.toFixed(2),
      potentialVat: potentialVat.toFixed(2),
      totalExposure: totalExposure.toFixed(2),
    },
  };
}
