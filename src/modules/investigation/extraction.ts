import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import type { EvidenceClaimInput } from "./types";

const nullableString = z.string().nullable().optional();
const nullableNumber = z.number().finite().nullable().optional();

export const DemurrageExtractionSchema = z.object({
  facts: z.array(
    z.object({
      claimType: z.enum([
        "CONTAINER_ID",
        "VESSEL_NAME",
        "VESSEL_MMSI",
        "TERMINAL",
        "ARRIVAL_TIME",
        "DISCHARGE_TIME",
        "AVAILABLE_TIME",
        "FREE_TIME_START",
        "FREE_DAYS",
        "FREE_TIME_EXPIRY",
        "RELEASE_TIME",
        "CHARGED_DAYS",
        "DAILY_RATE",
        "CHARGED_AMOUNT",
        "CURRENCY",
        "INVOICE_NUMBER",
        "INVOICE_DATE",
        "PORT_LAT",
        "PORT_LON",
      ]),
      claimText: z.string().min(1),
      value: z.union([z.string(), z.number(), z.boolean()]),
      valueType: z.enum([
        "TEXT",
        "NUMBER",
        "DATE_TIME",
        "DATE",
        "MONEY",
        "IDENTIFIER",
      ]),
      sourceQuote: z.string().min(1),
      pageNumber: z.number().int().min(1),
      observedAt: nullableString,
      timezone: nullableString,
      confidence: z.number().min(0).max(1).optional(),
    }),
  ),
  parserNotes: z.array(z.string()).default([]),
});

export type DemurrageExtraction = z.infer<typeof DemurrageExtractionSchema>;

export async function extractDemurrageEvidenceFromPdf(
  buffer: Buffer,
  apiKey: string,
): Promise<DemurrageExtraction> {
  const google = createGoogleGenerativeAI({ apiKey });
  const prompt = [
    "You are CargoIQ's evidence extraction engine.",
    "Extract only facts literally present in the attached demurrage PDF.",
    "Do not infer, calculate, reconcile, or fill missing values.",
    "Every fact MUST include an exact short quote from the document and the PDF page number.",
    "A fact without an exact quote is invalid.",
    "Use null by omitting a fact when the source does not clearly show it.",
    "For money, preserve the document's displayed major-unit amount exactly (for example 1850.00), plus the currency. Do not convert money into cents/minor units during extraction.",
    "For dates/times, preserve the document's timezone when stated.",
    "Do not treat headers, boilerplate, or generic terms as shipment-specific facts.",
    "Extract multiple conflicting facts when the document contains them; CargoIQ will investigate contradictions later.",
  ].join("\n");

  const result = await generateObject({
    model: google("gemini-2.0-flash") as any,
    schema: DemurrageExtractionSchema,
    prompt,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "file", data: buffer, mimeType: "application/pdf" },
        ],
      },
    ],
  });

  return DemurrageExtractionSchema.parse(result.object);
}

function parseObservedAt(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export function extractionToClaims(
  extraction: DemurrageExtraction,
  input: { caseId: string; documentId: string; documentVersionId: string },
): EvidenceClaimInput[] {
  return extraction.facts.map((fact) => {
    return {
    caseId: input.caseId,
    sourceId: input.documentId,
    documentVersionId: input.documentVersionId,
    claimType: fact.claimType,
    claimText: fact.claimText,
    normalizedValue: fact.value,
    valueType: fact.valueType,
    sourceQuote: fact.sourceQuote,
    pageNumber: fact.pageNumber,
    observedAt: parseObservedAt(fact.observedAt),
    timezone: fact.timezone ?? undefined,
    confidence: fact.confidence ?? 0.85,
    provenance: "DERIVED",
    sourceType: "CUSTOMER_PRIMARY",
    locationRef: `page:${fact.pageNumber}`,
    };
  });
}
