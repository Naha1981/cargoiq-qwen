import { ShipmentDocumentInput, ComplianceCheckResult } from '../schema';

export function checkInvoicePackingCrossReference(doc: ShipmentDocumentInput): ComplianceCheckResult {
  const base = {
    module: 'invoice_packing_crossref',
    moduleName: 'Invoice/Packing List Cross-Reference',
  };

  if (!doc.packingListItems || !doc.invoiceItems) {
    return {
      ...base,
      status: 'pass',
      message: 'No packing list provided for cross-reference. Skipped.',
      exposureZar: 0,
    };
  }

  const issues: string[] = [];
  let totalExposure = 0;

  for (let i = 0; i < doc.invoiceItems.length; i++) {
    const invItem = doc.invoiceItems[i];
    const packItem = doc.packingListItems[i];

    if (!packItem) {
      issues.push(`Invoice line ${i + 1} ("${invItem.description}") has no matching packing list entry.`);
      totalExposure += 36000;
      continue;
    }

    if (invItem.quantity !== packItem.quantity) {
      issues.push(
        `Quantity mismatch on "${invItem.description}": Invoice says ${invItem.quantity}, Packing List says ${packItem.quantity}.`
      );
      totalExposure += 36000;
    }

    const invDesc = invItem.description.toLowerCase().trim();
    const packDesc = packItem.description.toLowerCase().trim();
    if (invDesc !== packDesc && !invDesc.includes(packDesc) && !packDesc.includes(invDesc)) {
      issues.push(
        `Description mismatch on line ${i + 1}: Invoice="${invItem.description}", Packing="${packItem.description}".`
      );
      totalExposure += 18000;
    }
  }

  if (doc.invoiceItems.length !== doc.packingListItems.length) {
    issues.push(
      `Line count mismatch: Invoice has ${doc.invoiceItems.length} lines, Packing List has ${doc.packingListItems.length} lines.`
    );
    totalExposure += 36000;
  }

  if (issues.length === 0) {
    return {
      ...base,
      status: 'pass',
      message: 'Invoice and Packing List match. No discrepancies found.',
      exposureZar: 0,
    };
  }

  return {
    ...base,
    status: 'hold',
    message: `${issues.length} discrepancy(ies) found. SARS may trigger physical examination.`,
    exposureZar: totalExposure,
    details: { issues },
  };
}
