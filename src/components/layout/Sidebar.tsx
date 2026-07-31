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
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

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
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-outline-variant bg-surface-container-lowest">
      {/* Logo + workspace */}
      <div className="flex flex-col gap-3 border-b border-outline-variant px-6 pt-6 pb-5">
        <Logo size="sm" />
        <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
          {identity?.tenantName || "Trial Workspace"}
        </p>
        <span className="inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
          {identity?.plan || "—"}
        </span>
      </div>

      {/* Navigation — exactly 8 items */}
      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Primary">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "active-item-tint text-primary font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
              )}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="ember-accent absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-[linear-gradient(180deg,#7E2410_0%,#C83A12_50%,#F2451C_100%)]"
                />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[11px] font-semibold text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer — Upgrade Plan + user + real Clerk SignOut */}
      <div className="mt-auto flex flex-col gap-3 border-t border-outline-variant px-6 py-4">
        <button
          type="button"
          className="ember-button w-full rounded-lg py-2.5 text-sm font-bold tracking-wide text-white transition-opacity hover:opacity-95"
        >
          Upgrade Plan
        </button>
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-[12px] text-on-surface-variant">
            <span aria-hidden="true">●</span>
            <span className="truncate" title={identity?.userEmail || ""}>{identity?.userEmail || ""}</span>
          </div>
          <SignOutButton redirectUrl="/">
            <button
              type="button"
              className="flex w-full items-center gap-2 text-[12px] text-on-surface-variant transition-colors hover:text-error cursor-pointer"
            >
              <span aria-hidden="true">⤴</span>
              <span>Sign Out</span>
            </button>
          </SignOutButton>
        </div>
      </div>
    </aside>
  );
}
