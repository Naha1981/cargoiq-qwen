import { createHash } from "node:crypto";

export const MAX_INVESTIGATION_PDF_BYTES = 15 * 1024 * 1024;

export function sha256Buffer(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

export function validateInvestigationDocument(input: {
  fileName: string;
  mimeType: string;
  size: number;
}) {
  if (!input.fileName || input.fileName.length > 255) {
    throw new Error("INVALID_FILE_NAME");
  }
  if (input.mimeType !== "application/pdf") {
    throw new Error("PDF_ONLY");
  }
  if (!Number.isSafeInteger(input.size) || input.size <= 0) {
    throw new Error("INVALID_FILE_SIZE");
  }
  if (input.size > MAX_INVESTIGATION_PDF_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
}

export function assertPdfBytes(buffer: Buffer): void {
  if (buffer.length < 5 || buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error("INVALID_PDF_SIGNATURE");
  }
}

export function sanitizeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 255);
}
