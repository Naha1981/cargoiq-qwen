import Sidebar from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  identity: { tenantName: string | null; plan: string | null; userEmail: string; userName: string } | null;
}

export default function DashboardShell({ children, identity }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-surface-container-lowest text-on-surface">
      <Sidebar identity={identity} />
      <main className={cn("ml-[260px] flex-1")}>{children}</main>
    </div>
  );
}
