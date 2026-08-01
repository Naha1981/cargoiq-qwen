import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { probeGatewayHealth } from '@/lib/integrations/evolution/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/whatsapp/status
 * Live connection state for the configured instance. Poll target used by the
 * wizard's "auto-flip to Connected ✓ +27…" behaviour. Returns the real connectionState
 * from Evolution; never hardcoded.
 */
export async function GET() {
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'Auth not configured' }, { status: 503 });
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    const health = await probeGatewayHealth();
    const connected = health.reachable && health.connectionState === 'open';
    return NextResponse.json(
      {
        ok: true,
        connected,
        reachable: health.reachable,
        configured: health.configured,
        connectionState: health.connectionState,
        instance: health.instance,
        error: health.error,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WhatsApp status error]:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
