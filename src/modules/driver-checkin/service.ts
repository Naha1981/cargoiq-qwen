import { db } from '@/lib/db';
import { waitingTimeFindings, drivers, events, tenants } from '@/lib/db/schema';
import { generateId, normalizePhoneNumber } from '@/lib/utils';
import { eq, and, isNull } from 'drizzle-orm';
import { notifyWaitingTimeFound } from '@/lib/email';

interface CheckInData {
  reference: string;
  location: string;
  type: 'ARRIVED' | 'DEPARTED';
  timestamp: Date;
}

export async function processDriverCheckIn(tenantId: string, driverId: string | null, data: CheckInData) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");

  if (data.type === 'ARRIVED') {
    const newFinding = await db.insert(waitingTimeFindings).values({
      id: generateId(),
      tenantId,
      driverId,
      reference: data.reference,
      location: data.location,
      arrivedAt: data.timestamp,
      status: 'waiting',
    }).returning();

    await db.insert(events).values({
      id: generateId(),
      tenantId,
      type: 'DriverArrived',
      payload: JSON.stringify({ reference: data.reference, location: data.location }),
    });

    return {
      success: true,
      message: `Arrival logged at ${data.timestamp.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}`,
      data: newFinding[0],
    };
  }

  if (data.type === 'DEPARTED') {
    const existing = await db.query.waitingTimeFindings.findFirst({
      where: and(
        eq(waitingTimeFindings.tenantId, tenantId),
        eq(waitingTimeFindings.reference, data.reference),
        isNull(waitingTimeFindings.departedAt)
      ),
    });

    if (!existing) {
      return {
        success: false,
        message: `No active arrival found for ${data.reference}. Send ARRIVED first.`,
        data: null,
      };
    }

    const departedAt = data.timestamp;
    const totalMinutes = Math.round((departedAt.getTime() - existing.arrivedAt.getTime()) / 60000);
    const freeTimeMinutes = existing.freeTimeMinutes || 120;
    const billableMinutes = Math.max(0, totalMinutes - freeTimeMinutes);
    const ratePerHour = parseFloat(existing.ratePerHourZar || '1100');
    const ratePerMinute = ratePerHour / 60;
    const billableAmount = (billableMinutes * ratePerMinute).toFixed(2);

    const updated = await db.update(waitingTimeFindings)
      .set({
        departedAt,
        totalMinutes,
        billableMinutes,
        billableAmountZar: billableAmount,
        status: billableMinutes > 0 ? 'billable' : 'completed',
      })
      .where(eq(waitingTimeFindings.id, existing.id))
      .returning();

    await db.insert(events).values({
      id: generateId(),
      tenantId,
      type: 'DriverDeparted',
      payload: JSON.stringify({
        reference: data.reference,
        billableMinutes,
        billableAmount,
      }),
    });

    if (billableMinutes > 0) {
      notifyWaitingTimeFound({
        to: "fleet-manager@cargoiq.io",
        subject: `Billable waiting time: ${billableMinutes}min = R${billableAmount}`,
        html: `<p>Billable waiting time for reference <strong>${data.reference}</strong>: ${billableMinutes} minutes = <strong>R${billableAmount}</strong></p>`,
        text: `Billable waiting time for reference ${data.reference}: ${billableMinutes} minutes = R${billableAmount}`,
      }).catch(() => {});

      return {
        success: true,
        message: `Billable: ${Math.floor(billableMinutes / 60)}hr ${billableMinutes % 60}min = R${billableAmount}. Invoice ready to generate.`,
        data: updated[0],
      };
    }

    return {
      success: true,
      message: `Departed. Total: ${Math.floor(totalMinutes / 60)}hr ${totalMinutes % 60}min (within ${freeTimeMinutes}min free time). No charge.`,
      data: updated[0],
    };
  }

  return { success: false, message: 'Unknown command type.', data: null };
}

export async function resolveDriverAndTenant(phoneNumber: string) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");

  const normalized = normalizePhoneNumber(phoneNumber);
  const driver = await db.query.drivers.findFirst({
    where: eq(drivers.phoneNumber, normalized),
  });

  if (!driver) return null;

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, driver.tenantId),
  });

  if (!tenant || tenant.status !== 'active') return null;

  return { driver, tenant };
}
