"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Mail, Network, Shield, FileSearch, Eye, Settings } from "lucide-react";
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

interface DashboardShellProps {
  children: React.ReactNode;
  identity: { tenantName: string | null; plan: string | null; userEmail: string; userName: string } | null;
}

export default function DashboardShell({ children, identity }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-surface-container-lowest text-on-surface">
      <Sidebar identity={identity} />
      <div className="fixed inset-0 z-50 lg:hidden" aria-hidden={!mobileOpen}>
        <div className={cn("h-full w-full bg-black/40 transition-opacity", mobileOpen ? "opacity-100" : "pointer-events-none opacity-0")}
          onClick={() => setMobileOpen(false)} />
        <div className={cn("absolute left-0 top-0 h-full w-[84%] max-w-[320px] bg-surface-container-lowest shadow-xl transition-transform", mobileOpen ? "translate-x-0" : "-translate-x-full")}> 
          <div className="flex items-center justify-between border-b border-outline-variant px-4 py-4">
            <Logo size="sm" />
            <button type="button" className="rounded-full p-2 hover:bg-surface-container-high" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-1 px-3 py-3" aria-label="Mobile Primary">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={cn("flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium", isActive ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container-high")}> 
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-outline-variant px-4 py-4">
            <button type="button" className="ember-button mb-3 w-full rounded-lg px-3 py-2.5 text-sm font-semibold text-white">Upgrade Plan</button>
            <div className="text-sm text-on-surface-variant">
              <p className="truncate">{identity?.userEmail || ''}</p>
              <SignOutButton redirectUrl="/">
                <button type="button" className="mt-3 text-sm text-on-surface-variant hover:text-error">Sign Out</button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </div>
      <div className="flex min-h-screen w-full flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant bg-surface-container-lowest/95 px-4 backdrop-blur sm:px-6 lg:hidden">
          <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high text-on-surface" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Logo size="sm" />
          </div>
        </header>
        <main className={cn("flex-1 lg:ml-[260px]")}>{children}</main>
      </div>
    </div>
  );
}
