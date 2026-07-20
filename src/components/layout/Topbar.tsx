"use client";

import { Search, Bell, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Notification {
  id: string;
  monitorName: string;
  status: string;
  time: string;
}

const STATUS_DOT: Record<string, string> = {
  INVESTIGATING: "bg-incident", IDENTIFIED: "bg-degraded", MONITORING: "bg-degraded", RESOLVED: "bg-signal",
};

export function Topbar({ userName, plan }: { userName?: string | null; plan?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/notifications/recent")
      .then((r) => r.json())
      .then((d) => {
        setNotifs(d.notifications ?? []);
        setUnreadCount(d.unreadCount ?? 0);
      });
  }, []);

  return (
    <header className="glass sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border-subtle px-8">
      <button
        onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
        className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-muted transition-colors hover:border-border-subtle"
      >
        <Search size={14} />
        <span>Search monitors, incidents...</span>
        <kbd className="ml-2 rounded border border-border bg-bg px-1.5 py-0.5 font-mono text-[10px] text-text-muted">⌘K</kbd>
      </button>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button onClick={() => { setNotifOpen((v) => !v); setMenuOpen(false); }} className="relative text-text-secondary transition-colors hover:text-text-primary">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-incident text-[9px] font-medium text-white ring-2 ring-bg">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-10 w-72 rounded-md border border-border bg-surface shadow-card-hover">
              <div className="border-b border-border-subtle px-4 py-2.5">
                <p className="text-xs font-medium text-text-primary">Notifications</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifs.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-text-muted">No recent activity</p>
                ) : (
                  notifs.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => { router.push("/incidents"); setNotifOpen(false); }}
                      className="flex w-full items-start gap-2 px-4 py-2.5 text-left hover:bg-surface-hover"
                    >
                      <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[n.status] ?? "bg-text-muted"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-text-primary">{n.monitorName}</p>
                        <p className="text-[10px] text-text-muted">{n.status} · {n.time}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => { setMenuOpen((v) => !v); setNotifOpen(false); }} className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-signal/20 font-mono text-xs text-signal">
              {userName?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="text-left text-xs">
              <p className="text-text-primary">{userName ?? "User"}</p>
              <p className="text-text-muted">{plan ?? "Free"} plan</p>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-44 rounded-md border border-border bg-surface p-1 shadow-card-hover">
              <button
                onClick={() => { setMenuOpen(false); router.push("/profile"); }}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              >
                <User size={14} /> View Profile
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full rounded px-3 py-2 text-left text-sm text-text-secondary hover:bg-surface-hover hover:text-incident"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
