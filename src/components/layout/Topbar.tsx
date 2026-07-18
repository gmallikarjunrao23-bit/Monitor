"use client";

import { Search, Bell } from "lucide-react";

export function Topbar({ userName, plan }: { userName?: string | null; plan?: string }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border-subtle px-8">
      <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-muted">
        <Search size={14} />
        <span>Search monitors, incidents...</span>
        <kbd className="ml-2 rounded border border-border bg-bg px-1.5 py-0.5 font-mono text-[10px] text-text-muted">⌘K</kbd>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-text-secondary hover:text-text-primary">
          <Bell size={18} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-incident" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-signal/20 font-mono text-xs text-signal">
            {userName?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="text-xs">
            <p className="text-text-primary">{userName ?? "User"}</p>
            <p className="text-text-muted">{plan ?? "Free"} plan</p>
          </div>
        </div>
      </div>
    </header>
  );
}
