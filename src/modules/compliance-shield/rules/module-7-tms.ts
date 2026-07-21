import { ShipmentDocumentInput, ComplianceCheckResult } from '../schema';

export function checkTmsPreDeclaration(doc: ShipmentDocumentInput): ComplianceCheckResult {
  const base = {
    module: 'tms_predeclaration',
    moduleName: 'SARS TMS Pre-Declaration Checker',
  };

  if (!doc.isCrossBorderRoad) {
    return {
      ...base,
      status: 'pass',
      message: 'Not a cross-border road shipment. TMS pre-declaration not required.',
      exposureZar: 0,
    };
  }

  if (!doc.isForeignRegistered) {
    return {
      ...base,
      status: 'pass',
      message: 'Vehicle is SA-registered. TMS pre-declaration not required for domestic vehicles.',
      exposureZar: 0,
    };
  }

  if (!doc.tmsDeclarationNumber || doc.tmsDeclarationNumber.trim() === '') {
    const detentionCost = 25000;
    return {
      ...base,
      status: 'hold',
      message: `HOLD: Foreign-registered vehicle (${doc.vehicleRegistration || 'unknown reg'}) has NO TMS declaration number. Mandatory since 1 June 2026. NO SACU exemptions. Vehicle will be detained at border. Estimated cost: R${detentionCost.toLocaleString()}.`,
      exposureZar: detentionCost,
      details: {
        vehicleRegistration: doc.vehicleRegistration,
        isForeignRegistered: true,
        tmsDeclarationNumber: null,
        regulation: 'SARS TMS mandatory from 1 June 2026. All foreign vehicles. No SACU exemption.',
        penaltyRange: 'R15,000 – R36,000 per detained vehicle',
      },
    };
  }

  const tmsNumber = doc.tmsDeclarationNumber.trim();
  if (tmsNumber.length < 5) {
    return {
      ...base,
      status: 'warn',
      message: `TMS declaration number "${tmsNumber}" appears too short. Verify with SARS TMS portal before departure.`,
      exposureZar: 5000,
      details: { tmsDeclarationNumber: tmsNumber },
    };
  }

  return {
    ...base,
    status: 'pass',
    message: `TMS pre-declaration confirmed: ${tmsNumber}. Vehicle cleared for border crossing.`,
    exposureZar: 0,
    details: { tmsDeclarationNumber: tmsNumber, vehicleRegistration: doc.vehicleRegistration },
  };
}
