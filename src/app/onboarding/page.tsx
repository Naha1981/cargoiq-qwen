import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, tenants } from '@/lib/db/schema';
import { generateId } from '@/lib/utils';
import { sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import OnboardingForm from './form';

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  if (!db) {
    redirect('/login');
  }

  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.clerk_id, userId),
  });

  if (existingUser) {
    redirect('/dashboard');
  }

  return <OnboardingForm />;
}
