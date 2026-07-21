import { ShipmentDocumentInput, ComplianceCheckResult } from '../schema';

const TARIFF_AMENDMENTS = [
  { chapters: ['72', '73'], description: 'Steel safeguard duty', effectiveDate: '2026-06-12', note: 'Safeguard duty now applies. Confirm duty calculation reflects new rate.' },
  { chapters: ['39'], description: 'Polyethylene anti-dumping', effectiveDate: '2026-06-01', note: 'Anti-dumping duty applies to polyethylene imports. Verify rate.' },
  { chapters: ['84', '85'], description: 'Machinery tariff relief', effectiveDate: '2026-06-15', note: 'Reduced duty on qualifying machinery. Confirm eligibility.' },
];

export function checkHsCode(doc: ShipmentDocumentInput): ComplianceCheckResult {
  const base = {
    module: 'hs_code_validator',
    moduleName: 'HS Code Validator',
  };

  const hsCode = doc.hsCode?.trim();

  if (!hsCode) {
    return {
      ...base,
      status: 'hold',
      message: 'No HS code provided. SARS requires an 8-digit HS code on every declaration.',
      exposureZar: 50000,
    };
  }

  const cleanCode = hsCode.replace(/[.\s]/g, '');

  if (cleanCode.length < 8) {
    return {
      ...base,
      status: 'hold',
      message: `HS code "${hsCode}" is only ${cleanCode.length} digits. SARS requires exactly 8 digits. Declaration will be REJECTED.`,
      exposureZar: 50000,
      details: { providedCode: hsCode, requiredLength: 8, actualLength: cleanCode.length },
    };
  }

  if (cleanCode.length > 8) {
    return {
      ...base,
      status: 'warn',
      message: `HS code "${hsCode}" is ${cleanCode.length} digits. SARS uses 8 digits. Extra digits will be ignored but may indicate a data entry error.`,
      exposureZar: 0,
      details: { providedCode: hsCode },
    };
  }

  if (/^0+$/.test(cleanCode)) {
    return {
      ...base,
      status: 'hold',
      message: `HS code "${hsCode}" is all zeros. This is not a valid commodity code.`,
      exposureZar: 50000,
    };
  }

  const chapter = cleanCode.substring(0, 2);
  const amendment = TARIFF_AMENDMENTS.find(a => a.chapters.includes(chapter));

  if (amendment) {
    return {
      ...base,
      status: 'warn',
      message: `SARS amended ${amendment.description} on ${amendment.effectiveDate}. ${amendment.note}`,
      exposureZar: 25000,
      details: { hsCode: cleanCode, chapter, amendment },
    };
  }

  return {
    ...base,
    status: 'pass',
    message: `HS code ${cleanCode} is valid 8-digit format. No recent tariff amendments for chapter ${chapter}.`,
    exposureZar: 0,
    details: { hsCode: cleanCode, chapter },
  };
}
