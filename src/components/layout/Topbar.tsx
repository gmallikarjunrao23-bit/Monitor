"use client";

import { Search, Bell, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Topbar({ userName, plan }: { userName?: string | null; plan?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="glass sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border-subtle px-8">
      <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-muted transition-colors hover:border-border-subtle">
        <Search size={14} />
        <span>Search monitors, incidents...</span>
        <kbd className="ml-2 rounded border border-border bg-bg px-1.5 py-0.5 font-mono text-[10px] text-text-muted">⌘K</kbd>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-text-secondary transition-colors hover:text-text-primary">
          <Bell size={18} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-incident ring-2 ring-bg" />
        </button>

        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2">
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
