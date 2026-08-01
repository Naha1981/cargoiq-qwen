import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectInstanceAndFetchQr } from '@/lib/integrations/evolution/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/whatsapp/connect
 * Ensure the Evolution instance exists + connect it → returns a REAL QR (base64 data URL)
 * rendered as <img src=...> in the wizard. Identity is never taken from the client;
 * the caller is just an authenticated operator initiating the scan flow.
 */
export async function POST() {
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'Auth not configured' }, { status: 503 });
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    const result = await connectInstanceAndFetchQr();
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (error) {
    console.error('[WhatsApp connect error]:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
