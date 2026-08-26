import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { runComplianceShield } from '@/modules/compliance-shield/service';
import { shipments, complianceResults, events } from '@/lib/db/schema';
import { generateId } from '@/lib/utils';
import { consumeRateLimit, getRequestIp } from '@/lib/security';

const ExtractionSchema = z.object({
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

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ALLOWED_PDF_TYPES = ["application/pdf"];

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    if (!(await consumeRateLimit(`parse:${userId || getRequestIp(req)}`))) {
      return NextResponse.json({ error: 'RATE_LIMIT_EXCEEDED' }, { status: 429 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey || apiKey === "PASTE_YOUR_GEMINI_KEY_HERE") {
      return NextResponse.json({ configured: false, error: "AI parsing not configured. Add a Gemini API key to enable document extraction." }, { status: 200 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` }, { status: 400 });
    }

    const mimeType = file.type;
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
    const isPdf = ALLOWED_PDF_TYPES.includes(mimeType);

    if (!isImage && !isPdf) {
      return NextResponse.json({ error: `Unsupported file type: ${mimeType}. Accepted: PNG, JPEG, WebP, PDF.` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
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

    const extracted = ExtractionSchema.parse(object);

    if (!extracted.confidence || extracted.confidence === "low" || !extracted.hsCode || !extracted.declaredValueZar) {
      const appUser = await db!.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerk_id, userId as string),
      });

      return NextResponse.json({
        success: true,
        extraction: extracted,
        configured: true,
        couldNotRead: true,
        message: "We could not read this document clearly enough for a full compliance check. Key fields are missing or unclear. Please review manually.",
        tenantId: appUser?.tenantId ?? null,
      });
    }

    const doc = {
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

    const appUser = await db!.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerk_id, userId as string),
    });

    if (!appUser) {
      return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });
    }

    const { tenantId } = appUser;
    const shipmentId = generateId();

    const { results, overallStatus, totalExposureZar } = runComplianceShield(doc);

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

    return NextResponse.json({
      success: true,
      extraction: extracted,
      configured: true,
      couldNotRead: false,
      report: { shipmentId, tenantId, overallStatus, totalExposureZar, results, riskScore },
    });
  } catch (error) {
    console.error("[Parse Error]:", error);
    return NextResponse.json({ error: "EXTRACTION_FAILED", message: "AI extraction failed. Please try again with a clearer document." }, { status: 500 });
  }
}
