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
              colorPrimary: '#C83A12',
              colorForeground: '#101318',
              colorBackground: '#FFFFFF',
              colorInput: '#FFFFFF',
              colorInputForeground: '#101318',
              colorNeutral: '#5B6573',
              borderRadius: '0.25rem',
            },
            elements: {
              formButtonPrimary:
                'bg-[linear-gradient(135deg,#7E2410_0%,#C83A12_50%,#F2451C_100%)] text-white hover:opacity-90',
              cardBox: 'bg-white border border-[#E4E7EC] shadow-sm',
              headerTitle: 'text-[#101318]',
              headerSubtitle: 'text-[#5B6573]',
              formFieldLabel: 'text-[#344054]',
              formFieldInput: 'bg-white text-[#101318] border border-[#D0D5DD]',
              footerActionLink: 'text-[#C83A12]',
            },
          }}
        >
          <ClientLayout identity={identity}>{children}</ClientLayout>
        </ClerkProvider>
      </body>
    </html>
  );
}