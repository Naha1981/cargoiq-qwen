import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { db } from '@/lib/db';
import { shipments, complianceResults, events } from '@/lib/db/schema';
import { runComplianceShield } from '@/modules/compliance-shield/service';
import { generateId } from '@/lib/utils';

export const ExtractionSchema = z.object({
  shipmentRef: z.string().optional(),
  hsCode: z.string().optional(),
  invoiceQty: z.number().optional(),
  packingListQty: z.number().optional(),
  origin: z.enum(["SACU", "non-SACU", "unknown"]).optional(),
  vatApplied: z.boolean().optional(),
  truckReg: z.string().optional(),
  tmsNumber: z.string().optional(),
  productType: z.string().optional(),
  hasHPL: z.boolean().optional(),
  hasDA65: z.boolean().optional(),
  declaredValueZar: z.number().optional(),
  confidence: z.enum(["high", "medium", "low"]).optional(),
});

export type ExtractedFields = z.infer<typeof ExtractionSchema>;

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const ALLOWED_PDF_TYPES = ["application/pdf"];

export type FileValidationResult =
  | { ok: true; buffer: Buffer; mimeType: string }
  | { ok: false; status: number; error: string };

/**
 * Validate the uploaded file (presence, size, MIME type) and return its raw
 * bytes + mime type ready for extraction. Pure validation, no I/O.
 */
export async function validateUploadedFile(formData: FormData): Promise<FileValidationResult> {
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return { ok: false, status: 400, error: "No file provided" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, status: 400, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` };
  }

  const mimeType = file.type;
  const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
  const isPdf = ALLOWED_PDF_TYPES.includes(mimeType);

  if (!isImage && !isPdf) {
    return { ok: false, status: 400, error: `Unsupported file type: ${mimeType}. Accepted: PNG, JPEG, WebP, PDF.` };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return { ok: true, buffer, mimeType };
}

/**
 * Call the AI provider to extract structured fields from the document image.
 * Throws on provider/schema failure -- caller's existing outer try/catch
 * handles this identically to the pre-decomposition behavior.
 */
export async function extractDocumentFields(buffer: Buffer, mimeType: string, apiKey: string): Promise<ExtractedFields> {
  const base64Data = buffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${base64Data}`;

  const google = createGoogleGenerativeAI({ apiKey });

  const prompt = "Extract ONLY the following fields from this document. If a field is not clearly visible or legible, set it to null and set confidence to low. Do NOT guess or infer any value. Be precise and factual. Extract only what is literally on the document.";

  const { object } = await generateObject({
    model: google("gemini-2.0-flash") as any,
    schema: ExtractionSchema as any,
    prompt,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image", image: dataUri, mimeType },
        ],
      },
    ],
  });

  return ExtractionSchema.parse(object);
}

export function isLowConfidenceExtraction(extracted: ExtractedFields): boolean {
  return !extracted.confidence || extracted.confidence === "low" || !extracted.hsCode || !extracted.declaredValueZar;
}

export async function getTenantForClerkUser(userId: string) {
  return db!.query.users.findFirst({
    where: (users, { eq }) => eq(users.clerk_id, userId),
  });
}

/** Map extracted AI fields into the shape the Compliance Shield expects. */
export function buildComplianceDocument(extracted: ExtractedFields) {
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
  };
}

export { runComplianceShield };

export interface PersistComplianceRunParams {
  tenantId: string;
  extracted: ExtractedFields;
  results: ReturnType<typeof runComplianceShield>["results"];
  overallStatus: ReturnType<typeof runComplianceShield>["overallStatus"];
}

/** Persist compliance-check results and the resulting shipment record. */
export async function persistComplianceRun({ tenantId, extracted, results, overallStatus }: PersistComplianceRunParams) {
  const shipmentId = generateId();

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

  const riskScore = overallStatus === "hold" ? 5 : overallStatus === "warn" ? 3 : 1;
  await db!.insert(shipments).values({
    id: shipmentId,
    tenantId,
    reference: extracted.shipmentRef ?? `PARSED-${Date.now()}`,
    hsCode: extracted.hsCode,
    cargoDescription: extracted.productType,
    customsValueZar: extracted.declaredValueZar,
    riskScore,
    status: overallStatus === "hold" ? "held" : overallStatus === "warn" ? "review" : "cleared",
  } as any);

  return { shipmentId, riskScore };
}

export interface RecordComplianceEventParams {
  tenantId: string;
  shipmentId: string;
  overallStatus: string;
  totalExposureZar: number;
  results: ReturnType<typeof runComplianceShield>["results"];
}

/** Emit the domain event for a completed compliance run. */
export async function recordComplianceEvent({ tenantId, shipmentId, overallStatus, totalExposureZar, results }: RecordComplianceEventParams) {
  await db!.insert(events).values({
    id: generateId(),
    tenantId,
    type: "ComplianceShieldCompleted",
    payload: JSON.stringify({
      shipmentId, overallStatus, totalExposureZar, modulesRun: results.length,
      holds: results.filter(r => r.status === "hold").length,
      warnings: results.filter(r => r.status === "warn").length,
      extractedFrom: "ai",
    }),
  });
}
