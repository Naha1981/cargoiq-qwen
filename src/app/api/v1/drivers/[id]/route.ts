import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { drivers, tenants, users } from '@/lib/db/schema';
import { normalizePhoneNumber } from '@/lib/utils';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const patchDriverSchema = z.object({
  name: z.string().min(1).optional(),
  phoneNumber: z.string().min(1).optional(),
  defaultLocation: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

async function resolveTenant(userId: string) {
  if (!db) return null;
  const appUser = await db.query.users.findFirst({
    where: eq(users.clerk_id, userId as string),
  });
  if (!appUser) return null;
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, appUser.tenantId),
  });
  return tenant;
}

type RouteParams = { params: Promise<{ id: string }> };

/**
 * PATCH /api/v1/drivers/[id]
 * Edit a driver's name, phone (normalised to +27), default location, or active status.
 * Tenant-scoped: only drivers belonging to the authenticated user's tenant can be edited.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  if (!db) {
    return NextResponse.json(
      { error: 'SERVICE_UNAVAILABLE', message: 'Database not configured.' },
      { status: 503 }
    );
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const tenant = await resolveTenant(userId as string);
    if (!tenant) {
      return NextResponse.json({ error: 'TENANT_NOT_FOUND' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.query.drivers.findFirst({
      where: and(eq(drivers.id, id), eq(drivers.tenantId, tenant.id)),
    });
    if (!existing) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = patchDriverSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.phoneNumber !== undefined) {
      updates.phoneNumber = normalizePhoneNumber(parsed.data.phoneNumber);
    }
    if (parsed.data.defaultLocation !== undefined) {
      updates.defaultLocation = parsed.data.defaultLocation;
    }
    if (parsed.data.active !== undefined) updates.active = parsed.data.active;

    const [updated] = await db
      .update(drivers)
      .set(updates)
      .where(and(eq(drivers.id, id), eq(drivers.tenantId, tenant.id)))
      .returning();

    return NextResponse.json({ success: true, driver: updated });
  } catch (error) {
    console.error('[Driver PATCH error]:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to update driver.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/drivers/[id]
 * Remove a driver from the tenant's mapping. Tenant-scoped: only drivers
 * belonging to the authenticated user's tenant can be deleted.
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  if (!db) {
    return NextResponse.json(
      { error: 'SERVICE_UNAVAILABLE', message: 'Database not configured.' },
      { status: 503 }
    );
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const tenant = await resolveTenant(userId as string);
    if (!tenant) {
      return NextResponse.json({ error: 'TENANT_NOT_FOUND' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.query.drivers.findFirst({
      where: and(eq(drivers.id, id), eq(drivers.tenantId, tenant.id)),
    });
    if (!existing) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    await db
      .delete(drivers)
      .where(and(eq(drivers.id, id), eq(drivers.tenantId, tenant.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Driver DELETE error]:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to delete driver.' },
      { status: 500 }
    );
  }
}
