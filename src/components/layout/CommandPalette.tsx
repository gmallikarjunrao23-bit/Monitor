"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Activity, AlertTriangle, BarChart3, Globe, CreditCard, Settings, LayoutDashboard } from "lucide-react";

interface Monitor {
  id: string;
  name: string;
  target: string;
}

const STATIC_COMMANDS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Monitors", href: "/monitors", icon: Activity },
  { label: "Incidents", href: "/incidents", icon: AlertTriangle },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Status Pages", href: "/status-pages", icon: Globe },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const router = useRouter();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [close]);

  useEffect(() => {
    if (open && monitors.length === 0) {
      fetch("/api/monitors")
        .then((r) => r.json())
        .then((d) => setMonitors(d.monitors ?? []));
    }
  }, [open, monitors.length]);

  if (!open) return null;

  const filteredCommands = STATIC_COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));
  const filteredMonitors = monitors.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()));

  function go(href: string) {
    router.push(href);
    close();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 pt-24 px-4" onClick={close}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-card border border-border bg-surface shadow-card-hover animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
          <Search size={16} className="text-text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search monitors, pages..."
            className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
          <kbd className="rounded border border-border bg-bg px-1.5 py-0.5 font-mono text-[10px] text-text-muted">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length > 0 && (
            <div className="mb-2">
              <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">Pages</p>
              {filteredCommands.map((c) => (
                <button
                  key={c.href}
                  onClick={() => go(c.href)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                >
                  <c.icon size={15} /> {c.label}
                </button>
              ))}
            </div>
          )}

          {filteredMonitors.length > 0 && (
            <div>
              <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">Monitors</p>
              {filteredMonitors.map((m) => (
                <button
                  key={m.id}
                  onClick={() => go(`/monitors/${m.id}`)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                >
                  <Activity size={15} className="text-signal" />
                  <span className="truncate">{m.name}</span>
                </button>
              ))}
            </div>
          )}

          {filteredCommands.length === 0 && filteredMonitors.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-text-muted">No results for "{query}"</p>
          )}
        </div>
      </div>
    </div>
  );
            }
