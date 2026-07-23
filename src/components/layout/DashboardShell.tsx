import Sidebar from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  identity: { tenantName: string; plan: string; userEmail: string; userName: string } | null;
}

export default function DashboardShell({ children, identity }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-[#F1F4F8]">
      <Sidebar identity={identity} />
      <main className={cn("ml-60 flex-1")}>{children}</main>
    </div>
  );
}
