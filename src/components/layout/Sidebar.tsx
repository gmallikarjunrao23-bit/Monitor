"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Activity, AlertTriangle, BarChart3, Globe, CreditCard, Settings, ShieldCheck } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/monitors", label: "Monitors", icon: Activity },
  { href: "/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/status-pages", label: "Status Pages", icon: Globe },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="glass flex h-screen w-60 shrink-0 flex-col border-r border-border">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="relative h-7 w-7">
          <div className="absolute inset-0 rounded-md bg-signal/20 blur-[2px]" />
          <div className="absolute inset-[3px] rounded-[4px] bg-signal animate-glow-pulse" />
        </div>
        <span className="font-display text-[15px] font-semibold tracking-tight text-text-primary">InfraOps</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all ${
                active ? "bg-signal/10 text-signal" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              {active && <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-signal" />}
              <Icon size={16} strokeWidth={2} className="transition-transform group-hover:scale-110" />
              {label}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              pathname?.startsWith("/admin") ? "bg-incident/10 text-incident" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            }`}
          >
            <ShieldCheck size={16} strokeWidth={2} />
            Admin
          </Link>
        )}
      </nav>

      <div className="border-t border-border-subtle px-5 py-4">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-40" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
          </span>
          All systems operational
        </div>
      </div>
    </aside>
  );
}
