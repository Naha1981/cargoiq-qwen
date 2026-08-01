import { NextResponse } from 'next/server';
import { probeGatewayHealth } from '@/lib/integrations/evolution/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/whatsapp/health
 * Real gateway reachability probe. NEVER hardcoded green:
 *   - env missing    → reachable:false, configured:false (amber "Not configured")
 *   - host down/err → reachable:false, configured:true  (red "Unreachable")
 *   - host up        → reachable:true, configured:true  (green), plus connectionState
 */
export async function GET() {
  const health = await probeGatewayHealth();
  return NextResponse.json(health, { status: 200 });
}
