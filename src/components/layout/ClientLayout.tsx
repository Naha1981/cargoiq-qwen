'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/components/providers/AuthProvider';
import Sidebar from '@/components/layout/Sidebar';
import DashboardShell from '@/components/layout/DashboardShell';

const dashboardRoutes = [
  '/dashboard',
  '/queue',
  '/shipments',
  '/sentinel',
  '/carrier-audit',
  '/shadow-audit',
  '/settings',
  '/inbox',
  '/portals',
];

interface ClientLayoutProps {
  children: React.ReactNode;
  identity: { tenantName: string; plan: string; userEmail: string; userName: string } | null;
}

export default function ClientLayout({ children, identity }: ClientLayoutProps) {
  const pathname = usePathname();
  const isDashboardRoute = dashboardRoutes.some((route) => pathname.startsWith(route));

  return (
    <AuthProvider>
      {isDashboardRoute ? (
        <DashboardShell identity={identity}>{children}</DashboardShell>
      ) : (
        <div className="min-h-screen">{children}</div>
      )}
    </AuthProvider>
  );
}
