import { NextRequest, NextResponse } from 'next/server';
import { shipmentDocumentSchema } from '@/modules/compliance-shield/schema';
import { runComplianceShield } from '@/modules/compliance-shield/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = shipmentDocumentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid shipment document format',
          details: parsed.error.flatten(),
        },
      }, { status: 400 });
    }

    const startTime = Date.now();
    const { results, overallStatus, totalExposureZar } = runComplianceShield(parsed.data);
    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        overallStatus,
        totalExposureZar,
        results,
        meta: {
          modulesRun: results.length,
          durationMs,
          holds: results.filter(r => r.status === 'hold').length,
          warnings: results.filter(r => r.status === 'warn').length,
          passes: results.filter(r => r.status === 'pass').length,
        },
      },
    }, { status: 200 });

  } catch (error) {
    console.error('[Compliance Check Error]:', error);
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Compliance check failed',
      },
    }, { status: 500 });
  }
}
