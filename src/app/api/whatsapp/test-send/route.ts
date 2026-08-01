import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendEvolutionText, hasWhatsAppConfig } from '@/lib/integrations/evolution/client';
import { normalizePhoneNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/whatsapp/test-send
 * Optional "Send me a test message" affordance for the test-the-loop card.
 * The operator provides their own phone; we send the WhatsApp text so it lands
 * on the linked device, completing the outbound side of the loop. Inbound is
 * observed via the live check-in feed (see /api/whatsapp/checkins).
 */
export async function POST(req: NextRequest) {
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'Auth not configured' }, { status: 503 });
  }
  if (!hasWhatsAppConfig()) {
    return NextResponse.json(
      { ok: false, error: 'Evolution not configured' },
      { status: 503 }
    );
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const rawNumber = typeof body?.number === 'string' ? body.number : '';
    const text =
      typeof body?.text === 'string' && body.text.trim().length > 0
        ? body.text
        : 'CargoIQ test message: send "ARRIVED TEST-001 Bay 7" to this number to complete the loop.';

    if (!rawNumber) {
      return NextResponse.json(
        { ok: false, error: 'A destination number is required' },
        { status: 400 }
      );
    }

    const number = normalizePhoneNumber(rawNumber);
    // sendEvolutionText logs + swallows errors; surface whether the request was attempted.
    await sendEvolutionText(number, text);
    return NextResponse.json(
      { ok: true, number, sent: text },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WhatsApp test-send error]:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
