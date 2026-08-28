import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyItnSignature, isRequestFromPayfast } from '@/lib/integrations/payfast/client';
import { recordPaymentEvent } from '@/modules/billing/service';
import { consumeRateLimit } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * PayFast ITN (Instant Transaction Notification) webhook. PayFast calls this
 * server-to-server -- it is the ONLY authoritative source for payment
 * confirmation. The browser return_url redirect is never treated as proof
 * of payment (see PART D of the NahaLabs architecture: webhooks are the
 * source of truth, browser redirects are not).
 *
 * PayFast requires a 200 OK response quickly, and will retry on failure --
 * so this handler always returns 200 once the payload has been durably
 * logged, even if validation subsequently determines the event is not
 * authentic (rejected events are recorded, not silently dropped, so there is
 * an audit trail of spoofing attempts).
 */
export async function POST(req: NextRequest) {
  if (!db) {
    // Still return 200 so PayFast doesn't hammer retries against a
    // misconfigured deployment forever; nothing can be persisted regardless.
    console.error('[PayFast ITN] Database not configured; dropping notification.');
    return new NextResponse('OK', { status: 200 });
  }

  const rawBody = await req.text();
  const params = new URLSearchParams(rawBody);
  const fields: Record<string, string> = {};
  params.forEach((value, key) => {
    fields[key] = value;
  });

  if (!fields.pf_payment_id) {
    return new NextResponse('OK', { status: 200 });
  }

  // Rate-limit by pf_payment_id rather than IP -- PayFast's own servers are
  // the caller, so IP-based limiting would throttle legitimate retries.
  if (!(await consumeRateLimit(`payfast-itn:${fields.pf_payment_id}`, 20, 60_000))) {
    return new NextResponse('OK', { status: 200 });
  }

  const signatureValid = verifyItnSignature(fields);

  const forwardedFor = req.headers.get('x-forwarded-for');
  const sourceIp = forwardedFor ? forwardedFor.split(',')[0].trim() : req.headers.get('x-real-ip') || '';
  const sourceValid = sourceIp ? await isRequestFromPayfast(sourceIp) : false;

  if (!signatureValid) {
    console.error('[PayFast ITN] Signature verification failed for pf_payment_id:', fields.pf_payment_id);
  }
  if (!sourceValid) {
    console.error('[PayFast ITN] Source host verification failed for pf_payment_id:', fields.pf_payment_id, 'ip:', sourceIp);
  }

  try {
    const result = await recordPaymentEvent(
      {
        pf_payment_id: fields.pf_payment_id,
        payment_status: fields.payment_status || 'UNKNOWN',
        m_payment_id: fields.m_payment_id,
        amount_gross: fields.amount_gross,
        token: fields.token,
      },
      signatureValid,
      sourceValid,
      rawBody
    );

    if (result.alreadyProcessed) {
      console.log('[PayFast ITN] Duplicate notification, already processed:', fields.pf_payment_id);
    }
  } catch (error) {
    console.error('[PayFast ITN] Failed to record payment event:', error);
  }

  return new NextResponse('OK', { status: 200 });
}
