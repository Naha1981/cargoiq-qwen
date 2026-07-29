import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk, IBM_Plex_Sans } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import ClientLayout from '@/components/layout/ClientLayout';
import { ensureTenant } from '@/lib/tenant/ensure';
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

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display-lg',
  display: 'swap',
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body-md',
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
  let identity: { tenantName: string | null; plan: string | null; userEmail: string; userName: string } | null = null;

  try {
    const authResult = await (await import('@clerk/nextjs/server')).auth();
    const userId = authResult.userId;

    if (!userId) {
      redirect('/login');
    }

    const ident = await ensureTenant(userId);

    if (ident) {
      identity = {
        tenantName: ident.tenant.name,
        plan: ident.tenant.plan || null,
        userEmail: ident.user.email,
        userName: ident.user.name || '',
      };
    } else {
      let fallbackEmail = '';
      try {
        const client = await (await import('@clerk/nextjs/server')).clerkClient();
        const clerkUser = await client.users.getUser(userId);
        fallbackEmail = clerkUser.emailAddresses?.[0]?.emailAddress?.trim() || '';
      } catch {
        // ignore
      }
      identity = {
        tenantName: null,
        plan: null,
        userEmail: fallbackEmail,
        userName: '',
      };
    }
  } catch {
    // ignore auth lookup errors
  }

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${ibmPlexSans.variable} font-body-md antialiased`}>
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: '#E8B84B',
              colorForeground: '#e0e2ea',
              colorBackground: '#0a0e13',
              colorInput: '#1c2025',
              colorInputForeground: '#e0e2ea',
              borderRadius: '0.125rem',
            },
            elements: {
              formButtonPrimary: 'bg-primary-container hover:bg-primary',
              cardBox: 'bg-surface-container-lowest border border-outline-variant',
              headerTitle: 'text-on-surface',
              headerSubtitle: 'text-on-surface-variant',
              formFieldLabel: 'text-on-surface-variant',
              formFieldInput: 'bg-surface-container text-on-surface border-outline-variant',
              footerActionLink: 'text-primary-container',
            },
          }}
        >
          <ClientLayout identity={identity}>{children}</ClientLayout>
        </ClerkProvider>
      </body>
    </html>
  );
}