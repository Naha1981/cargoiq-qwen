import { ShipmentDocumentInput, ComplianceCheckResult } from '../schema';

const SUGAR_CHAPTERS = ['17', '18', '19', '20', '21', '22'];

export function checkDa179(doc: ShipmentDocumentInput): ComplianceCheckResult {
  const base = {
    module: 'da179_hpl',
    moduleName: 'DA179 Sugar/Health Promotion Levy',
  };

  const hsCode = doc.hsCode?.replace(/[.\s]/g, '') || '';
  const chapter = hsCode.substring(0, 2);
  const containsSugar = doc.containsSugar;
  const cargoDesc = doc.cargoDescription?.toLowerCase() || '';

  const sugarKeywords = ['sugar', 'sucrose', 'glucose', 'fructose', 'sweetened', 'confectionery', 'chocolate', 'candy', 'soft drink', 'energy drink', 'juice', 'syrup', 'honey'];
  const descriptionSuggestsSugar = sugarKeywords.some(kw => cargoDesc.includes(kw));

  const isSugarChapter = SUGAR_CHAPTERS.includes(chapter);
  const isLikelySugar = containsSugar === true || descriptionSuggestsSugar || isSugarChapter;

  if (!isLikelySugar) {
    return {
      ...base,
      status: 'pass',
      message: 'Product does not appear to contain sugar. Health Promotion Levy not applicable.',
      exposureZar: 0,
    };
  }

  const customsValue = doc.customsValueZar || 0;
  return {
    ...base,
    status: 'warn',
    message: `Product appears to contain sugar (chapter ${chapter || 'unknown'}). Health Promotion Levy (DA179) may apply. Confirm sugar content and calculate HPL before submission.`,
    exposureZar: customsValue > 0 ? customsValue * 0.05 : 10000,
    details: {
      hsCode,
      chapter,
      containsSugar: containsSugar ?? 'unknown',
      descriptionSuggestsSugar,
      isSugarChapter,
      note: 'HPL = R0.021/gram of sugar above 4g per 100ml/100g. Confirm with product spec sheet.',
    },
  };
}
