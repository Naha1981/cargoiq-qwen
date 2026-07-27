import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import ClientLayout from '@/components/layout/ClientLayout';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CargoIQ — AI Compliance & Revenue Recovery',
  description: "South Africa's first AI-powered compliance and cost-containment platform for freight forwarders and customs clearing agents.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let identity: { tenantName: string; plan: string; userEmail: string; userName: string } | null = null;
  let userId: string | null = null;
  let dbReachable = false;

  try {
    const authResult = await (await import('@clerk/nextjs/server')).auth();
    userId = authResult.userId;
    if (!userId) {
      redirect('/login');
    }
    if (!db) {
      // db not configured — render without redirect to avoid loops
    } else {
      dbReachable = true;

      // Try clerk_id match first (normal path)
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerk_id, userId as string),
      });

      if (existingUser && existingUser.tenantId) {
        const tenant = await db.query.tenants.findFirst({
          where: (tenants, { eq }) => eq(tenants.id, existingUser.tenantId),
        });
        if (tenant) {
          identity = {
            tenantName: tenant.name,
            plan: tenant.plan || 'Starter',
            userEmail: existingUser.email,
            userName: existingUser.name || '',
          };
        }
      }
    }
  } catch {
    // ignore auth lookup errors
  }

  // redirect unonboarded users (has userId but no tenant identity)
  if (userId && dbReachable && !identity) {
    redirect('/onboarding');
  }

  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: '#B8860B',
              colorForeground: '#F1F4F8',
              colorBackground: '#1A2332',
              colorInput: '#243044',
              colorInputForeground: '#F1F4F8',
              borderRadius: '0.5rem',
            },
            elements: {
              formButtonPrimary: 'bg-[#B8860B] hover:bg-[#9a7209]',
              cardBox: 'bg-[#1A2332] border border-white/10',
              headerTitle: 'text-[#F1F4F8]',
              headerSubtitle: 'text-gray-400',
              formFieldLabel: 'text-gray-300',
              formFieldInput: 'bg-[#243044] text-[#F1F4F8] border-white/10',
              footerActionLink: 'text-[#B8860B]',
            },
          }}
        >
          <ClientLayout identity={identity}>{children}</ClientLayout>
        </ClerkProvider>
      </body>
    </html>
  );
}