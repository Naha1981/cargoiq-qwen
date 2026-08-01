import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { disconnectInstance } from '@/lib/integrations/evolution/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * DELETE /api/whatsapp/disconnect
 * Tear down the active WhatsApp session on the configured instance (logout).
 * This is the REAL Disconnect button handler — only surfaced when connected.
 */
export async function DELETE() {
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'Auth not configured' }, { status: 503 });
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    const result = await disconnectInstance();
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (error) {
    console.error('[WhatsApp disconnect error]:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
