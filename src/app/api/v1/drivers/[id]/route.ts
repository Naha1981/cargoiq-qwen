import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { getTenantForUser } from '@/lib/tenant/for-user';
import { getDriverForTenant, updateDriverForTenant, deleteDriverForTenant } from '@/modules/logistics/service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const patchDriverSchema = z.object({
  name: z.string().min(1).optional(),
  phoneNumber: z.string().min(1).optional(),
  defaultLocation: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

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
    const resolved = await getTenantForUser(userId);
    if (!resolved) {
      return NextResponse.json({ error: 'TENANT_NOT_FOUND' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await getDriverForTenant(id, resolved.tenant.id);
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

    const updated = await updateDriverForTenant(id, resolved.tenant.id, parsed.data);
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
    const resolved = await getTenantForUser(userId);
    if (!resolved) {
      return NextResponse.json({ error: 'TENANT_NOT_FOUND' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await getDriverForTenant(id, resolved.tenant.id);
    if (!existing) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    await deleteDriverForTenant(id, resolved.tenant.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Driver DELETE error]:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to delete driver.' },
      { status: 500 }
    );
  }
}
