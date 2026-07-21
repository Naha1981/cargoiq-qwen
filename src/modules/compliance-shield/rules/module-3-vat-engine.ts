import { ShipmentDocumentInput, ComplianceCheckResult } from '../schema';

const SACU_COUNTRIES = ['ZA', 'BW', 'LS', 'NA', 'SZ'];

export function checkVatEngine(doc: ShipmentDocumentInput): ComplianceCheckResult {
  const base = {
    module: 'sacu_vat_engine',
    moduleName: 'SACU/Non-SACU VAT Engine',
  };

  const origin = doc.originCountry?.toUpperCase().trim();
  const customsValue = doc.customsValueZar;

  if (!origin) {
    return {
      ...base,
      status: 'warn',
      message: 'Origin country not specified. Cannot determine SACU/Non-SACU VAT treatment.',
      exposureZar: 0,
    };
  }

  if (!customsValue || customsValue <= 0) {
    return {
      ...base,
      status: 'warn',
      message: 'Customs value not provided or is zero. Cannot calculate VAT.',
      exposureZar: 0,
    };
  }

  const isSacu = SACU_COUNTRIES.includes(origin) || doc.isSacuOrigin === true;

  if (isSacu) {
    const vatAmount = customsValue * 0.15;
    return {
      ...base,
      status: 'pass',
      message: `SACU origin (${origin}). VAT = 15% × R${customsValue.toLocaleString()} = R${vatAmount.toLocaleString()}. No uplift required.`,
      exposureZar: 0,
      details: { origin, isSacu: true, vatAmount, calculation: `${customsValue} × 0.15` },
    };
  }

  const uplift = customsValue * 0.10;
  const vatBase = customsValue + uplift;
  const vatAmount = vatBase * 0.15;
  const vatWithoutUplift = customsValue * 0.15;
  const underpaymentRisk = vatAmount - vatWithoutUplift;

  return {
    ...base,
    status: underpaymentRisk > 1000 ? 'warn' : 'pass',
    message: `Non-SACU origin (${origin}). VAT requires 10% uplift: 15% × (R${customsValue.toLocaleString()} + R${uplift.toLocaleString()}) = R${vatAmount.toLocaleString()}. Ensure your declaration includes the uplift.`,
    exposureZar: underpaymentRisk > 1000 ? underpaymentRisk : 0,
    details: {
      origin,
      isSacu: false,
      customsValue,
      uplift,
      vatBase,
      vatAmount,
      underpaymentRisk: underpaymentRisk.toFixed(2),
      calculation: `0.15 × (${customsValue} + ${uplift}) = ${vatAmount}`,
    },
  };
}
