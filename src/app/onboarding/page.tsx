import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import OnboardingForm from './form';

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  if (!db) {
    return (
      <div className="min-h-screen bg-[#1A2332] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg bg-[#243044] p-6 text-center">
          <p className="text-gray-300">We are connecting your account — please reload in a moment.</p>
        </div>
      </div>
    );
  }

  // Unified lookup by clerk_id (normal path)
  const existingByClerkId = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.clerk_id, userId),
  });

  // Also check by email for legacy rows
  let email = '';
  try {
    const clerkMod = await import('@clerk/nextjs/server');
    const clerkUser = await clerkMod.clerkClient().users.getUser(userId);
    email = clerkUser.emailAddresses?.[0]?.emailAddress?.trim() || '';
  } catch {
    // ignore
  }

  const existingByEmail = email ? await db.query.users.findFirst({
    where: (u, { sql }) => sql`LOWER(${u.email}) = LOWER(${email})`,
  }) : null;

  const existing = existingByClerkId ?? existingByEmail;

  if (existing && existing.tenantId) {
    const tenant = await db.query.tenants.findFirst({
      where: (t, { eq }) => eq(t.id, existing.tenantId),
    });
    if (tenant) {
      redirect('/dashboard');
    }
  }

  return <OnboardingForm />;
}
