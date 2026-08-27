import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  buildComplianceDocument,
  runComplianceShieldForNewShipment,
} from '@/modules/compliance-shield/service';

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

// Compliance-domain logic (document mapping, check execution, persistence,
// event emission) lives in src/modules/compliance-shield -- re-exported here
// only so route.ts's import list doesn't need to change. Moved out of this
// file during Phase 4 (domain module structure) to remove duplication with
// runAndPersistComplianceShield, which already existed in that module.
export { buildComplianceDocument, runComplianceShieldForNewShipment };
