"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Mail,
  Network,
  Shield,
  FileSearch,
  Eye,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/queue", label: "Queue", icon: ClipboardList, badge: 12 },
  { href: "/inbox", label: "Inbox", icon: Mail },
  { href: "/portals", label: "Portals", icon: Network },
  { href: "/sentinel", label: "Sentinel", icon: Shield },
  { href: "/carrier-audit", label: "Carrier Audit", icon: FileSearch },
  { href: "/shadow-audit", label: "Shadow Audit", icon: Eye },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col bg-[#1A2332]">
      <div className="flex flex-col gap-4 px-5 pt-6 pb-4">
        <div>
          <div className="flex items-baseline gap-1 font-sans font-bold text-lg tracking-tight">
            <span className="text-white">Cargo</span>
            <span className="text-[#B8860B]">IQ</span>
          </div>
          <p className="mt-1 truncate text-xs text-white">Acme Logistics (Pty) Ltd</p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-[#B8860B]/20 px-2 py-0.5 text-[10px] font-medium text-[#B8860B]">
          Growth
        </span>
      </div>

      <nav className="mt-2 flex-1 space-y-0.5 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "font-['Inter'] font-medium text-[16px]",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-[#94A3B8] hover:bg-white/5 hover:text-white",
                item.badge && "relative"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#DC2626] px-1.5 text-[11px] font-semibold text-white">
                  {item.badge}
                </span>
              ) : null}
              {isActive ? (
                <span className="ml-auto h-4 w-0.5 rounded-full bg-[#B8860B]" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-white/10 px-5 py-4">
        <p className="truncate text-xs text-[#64748B]">admin@acme.co.za</p>
        <button
          type="button"
          className="flex items-center gap-2 text-left text-xs text-[#94A3B8] transition-colors hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
