import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { consumeRateLimit, getRequestIp } from '@/lib/security';
import {
  validateUploadedFile,
  extractDocumentFields,
  isLowConfidenceExtraction,
  getTenantForClerkUser,
  buildComplianceDocument,
  runComplianceShield,
  persistComplianceRun,
  recordComplianceEvent,
} from './service';

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
    const validated = await validateUploadedFile(formData);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: validated.status });
    }

    const extracted = await extractDocumentFields(validated.buffer, validated.mimeType, apiKey);

    if (isLowConfidenceExtraction(extracted)) {
      const appUser = await getTenantForClerkUser(userId);

      return NextResponse.json({
        success: true,
        extraction: extracted,
        configured: true,
        couldNotRead: true,
        message: "We could not read this document clearly enough for a full compliance check. Key fields are missing or unclear. Please review manually.",
        tenantId: appUser?.tenantId ?? null,
      });
    }

    const doc = buildComplianceDocument(extracted);

    const appUser = await getTenantForClerkUser(userId);
    if (!appUser) {
      return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });
    }

    const { tenantId } = appUser;
    const { results, overallStatus, totalExposureZar } = runComplianceShield(doc);

    const { shipmentId, riskScore } = await persistComplianceRun({ tenantId, extracted, results, overallStatus });
    await recordComplianceEvent({ tenantId, shipmentId, overallStatus, totalExposureZar, results });

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
