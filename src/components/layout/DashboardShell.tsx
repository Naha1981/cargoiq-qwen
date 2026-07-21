import Sidebar from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-[#F1F4F8]">
      <Sidebar />
      <main className={cn("ml-60 flex-1")}>{children}</main>
    </div>
  );
}
