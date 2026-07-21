'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/components/providers/AuthProvider';
import Sidebar from '@/components/layout/Sidebar';

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

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = dashboardRoutes.some((route) => pathname.startsWith(route));

  return (
    <AuthProvider>
      {isDashboardRoute ? (
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-60">{children}</main>
        </div>
      ) : (
        <div className="min-h-screen">{children}</div>
      )}
    </AuthProvider>
  );
}
