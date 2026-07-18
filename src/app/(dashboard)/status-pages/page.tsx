"use client";

import { useState } from "react";
import { Plus, Globe, ExternalLink, Eye, Copy } from "lucide-react";
import { PulseLine } from "@/components/dashboard/PulseLine";

const MOCK_PAGES = [
  { id: "1", title: "myapp Status", slug: "myapp", monitors: 5, isPublic: true, uptimePercent: 99.94 },
];

export default function StatusPagesPage() {
  const [pages] = useState(MOCK_PAGES);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Status Pages</h1>
          <p className="mt-1 text-sm text-text-secondary">Public pages you can share with customers</p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-signal px-4 py-2 text-sm font-medium text-bg hover:opacity-90">
          <Plus size={16} /> Create Status Page
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border py-20 text-center">
          <Globe size={32} className="mb-3 text-text-muted" />
          <p className="text-sm text-text-secondary">No status pages yet</p>
          <p className="mt-1 text-xs text-text-muted">Create one to share live uptime with your users</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {pages.map((p) => (
            <div key={p.id} className="rounded-card border border-border bg-surface p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-signal animate-glow-pulse" />
                    <h3 className="font-display text-base font-medium text-text-primary">{p.title}</h3>
                  </div>
                  <p className="mt-1 font-mono text-xs text-text-muted">status.infraops.app/{p.slug}</p>
                </div>
                <span className="rounded-full border border-signal/30 bg-signal/10 px-2 py-0.5 text-[10px] font-medium text-signal">
                  {p.isPublic ? "PUBLIC" : "PRIVATE"}
                </span>
              </div>

              <div className="mt-4 h-8 opacity-70">
                <PulseLine status="up" className="h-full w-full" />
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3 text-xs">
                <span className="font-mono text-text-secondary">{p.monitors} monitors · {p.uptimePercent}% uptime</span>
                <div className="flex gap-2">
                  <button className="rounded-md border border-border p-1.5 text-text-secondary hover:bg-surface-hover">
                    <Copy size={12} />
                  </button>
                  <button className="rounded-md border border-border p-1.5 text-text-secondary hover:bg-surface-hover">
                    <Eye size={12} />
                  </button>
                  <button className="rounded-md border border-border p-1.5 text-text-secondary hover:bg-surface-hover">
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border text-text-muted hover:border-signal hover:text-signal">
            <Plus size={20} />
            <span className="text-sm">New status page</span>
          </button>
        </div>
      )}
    </div>
  );
}
