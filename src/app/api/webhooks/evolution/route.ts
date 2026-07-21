import { NextRequest, NextResponse } from 'next/server';
import { whatsappCheckInSchema } from '@/modules/driver-checkin/schema';
import { processDriverCheckIn, resolveDriverAndTenant } from '@/modules/driver-checkin/service';

const processedMessages = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = whatsappCheckInSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const { source, message, timestamp, messageId } = parsed.data;

    const dedupeKey = messageId || `${source}-${timestamp}-${message}`;
    if (processedMessages.has(dedupeKey)) {
      return NextResponse.json({ status: 'duplicate', message: 'Already processed' }, { status: 200 });
    }
    processedMessages.add(dedupeKey);

    if (processedMessages.size > 10000) {
      const first = processedMessages.values().next().value;
      if (first) processedMessages.delete(first);
    }

    const msgUpper = message.toUpperCase().trim();
    const match = msgUpper.match(/^(ARRIVED|DEPARTED|STATUS|RLA|HELP)\s*([A-Z0-9\-]*)?\s*(.*)?$/);

    if (!match) {
      return NextResponse.json({ status: 'ignored', reason: 'Unrecognized format' }, { status: 200 });
    }

    const [, command, reference, location] = match;

    if (command === 'HELP') {
      return NextResponse.json({
        status: 'ok',
        reply: 'Commands:\nARRIVED [ref] [location]\nDEPARTED [ref]\nSTATUS [container]\nRLA [importer]\nHELP',
      }, { status: 200 });
    }

    const resolved = await resolveDriverAndTenant(source);
    if (!resolved) {
      return NextResponse.json({
        status: 'error',
        reply: 'Phone number not registered. Contact your fleet manager.',
      }, { status: 200 });
    }

    const { driver, tenant } = resolved;

    if (command === 'ARRIVED' || command === 'DEPARTED') {
      if (!reference) {
        return NextResponse.json({
          status: 'error',
          reply: 'Missing reference. Format: ARRIVED CIQ-2026-00247 Location Name',
        }, { status: 200 });
      }

      const eventDate = timestamp ? new Date(timestamp * 1000) : new Date();

      const result = await processDriverCheckIn(tenant.id, driver.id, {
        reference,
        location: location?.trim() || 'Unknown',
        type: command as 'ARRIVED' | 'DEPARTED',
        timestamp: eventDate,
      });

      return NextResponse.json({
        status: result.success ? 'ok' : 'error',
        reply: result.message,
        data: result.data,
      }, { status: 200 });
    }

    if (command === 'STATUS') {
      return NextResponse.json({
        status: 'ok',
        reply: `Container ${reference || 'unknown'}: Status check coming in next module.`,
      }, { status: 200 });
    }

    if (command === 'RLA') {
      return NextResponse.json({
        status: 'ok',
        reply: `RLA check for ${reference || 'unknown'}: Coming in RLA Sentinel module.`,
      }, { status: 200 });
    }

    return NextResponse.json({ status: 'ignored' }, { status: 200 });

  } catch (error) {
    console.error('[Evolution Webhook Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
