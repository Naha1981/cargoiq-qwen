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
import { SignOutButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/queue", label: "Queue", icon: ClipboardList, badge: 5 },
  { href: "/inbox", label: "Inbox", icon: Mail },
  { href: "/portals", label: "Portals", icon: Network },
  { href: "/sentinel", label: "Sentinel", icon: Shield },
  { href: "/carrier-audit", label: "Carrier Audit", icon: FileSearch },
  { href: "/shadow-audit", label: "Shadow Audit", icon: Eye },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  identity: { tenantName: string | null; plan: string | null; userEmail: string; userName: string } | null
}

export default function Sidebar({ identity }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col bg-surface-container-low border-r border-outline-variant">
      <div className="flex flex-col gap-4 px-6 pt-6 pb-4">
        <div className="flex items-baseline gap-1 font-display-lg text-headline-md text-on-surface">
          <span className="text-white">Cargo</span>
          <span className="text-iq-orange">IQ</span>
        </div>
        <p className="mt-1 truncate text-[10px] font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
          {identity?.tenantName || "Trial Workspace"}
        </p>
        <span className="inline-flex w-fit rounded-full bg-primary-container/20 px-2 py-0.5 text-[10px] font-label-caps text-label-caps text-primary">
          {identity?.plan || "—"}
        </span>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "font-body-md text-body-md",
                isActive
                  ? "text-primary font-bold border-r-2 border-primary bg-surface-container-high"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-risk-red px-1.5 text-[11px] font-semibold text-on-primary-container">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-outline-variant px-6 py-4">
        <button className="w-full py-2 bg-primary-container text-on-primary-container font-bold text-label-caps rounded hover:opacity-90 transition-opacity">
          Upgrade Plan
        </button>
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-on-surface-variant text-[12px]">
            <span className="material-symbols-outlined text-[18px]">account_circle</span>
            <span className="truncate">{identity?.userEmail || ""}</span>
          </div>
          <SignOutButton redirectUrl="/">
            <button
              type="button"
              className="flex items-center gap-3 text-on-surface-variant hover:text-error transition-colors text-[12px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sign Out</span>
            </button>
          </SignOutButton>
        </div>
      </div>
    </aside>
  );
}