"use client";

import { useState } from "react";
import { MonitorCard } from "@/components/monitors/MonitorCard";
import { Plus, Search, LayoutGrid, List, SlidersHorizontal } from "lucide-react";

const MOCK_MONITORS = [
  { id: "1", name: "api.myapp.com", target: "https://api.myapp.com/health", status: "UP" as const, uptimePercent: 99.98, responseTimeMs: 142, type: "HTTPS" },
  { id: "2", name: "checkout-service", target: "https://checkout.myapp.com", status: "DEGRADED" as const, uptimePercent: 98.2, responseTimeMs: 890, type: "API" },
  { id: "3", name: "auth-db", target: "10.0.4.12:5432", status: "DOWN" as const, uptimePercent: 94.1, type: "TCP" },
  { id: "4", name: "cdn-edge", target: "https://cdn.myapp.com", status: "UP" as const, uptimePercent: 100, responseTimeMs: 38, type: "HTTPS" },
  { id: "5", name: "webhook-relay", target: "https://hooks.myapp.com", status: "UP" as const, uptimePercent: 99.87, responseTimeMs: 210, type: "API" },
];

const FILTERS = ["All", "Up", "Degraded", "Down", "Paused"];

export default function MonitorsPage() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = MOCK_MONITORS.filter((m) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Up" && m.status === "UP") ||
      (filter === "Degraded" && m.status === "DEGRADED") ||
      (filter === "Down" && m.status === "DOWN");
    const matchesQuery = m.name.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Monitors</h1>
          <p className="mt-1 text-sm text-text-secondary">{MOCK_MONITORS.length} monitors · 3 up, 1 degraded, 1 down</p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-signal px-4 py-2 text-sm font-medium text-bg hover:opacity-90">
          <Plus size={16} /> Add Monitor
        </button>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f ? "bg-signal/10 text-signal" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5">
            <Search size={14} className="text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search monitors..."
              className="w-40 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>
          <button className="rounded-md border border-border bg-surface p-2 text-text-secondary hover:bg-surface-hover">
            <SlidersHorizontal size={14} />
          </button>
          <div className="flex items-center gap-0.5 rounded-md border border-border bg-surface p-1">
            <button
              onClick={() => setView("grid")}
              className={`rounded p-1.5 ${view === "grid" ? "bg-signal/10 text-signal" : "text-text-muted"}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded p-1.5 ${view === "list" ? "bg-signal/10 text-signal" : "text-text-muted"}`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border py-20 text-center">
          <p className="text-sm text-text-secondary">No monitors match "{query}"</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((m) => (
            <MonitorCard key={m.id} {...m} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface text-left text-xs text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Uptime</th>
                <th className="px-4 py-3 font-medium">Response</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-border-subtle bg-surface/50 hover:bg-surface-hover">
                  <td className="px-4 py-3 font-medium text-text-primary">{m.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{m.type}</td>
                  <td className="px-4 py-3">
                    <span className={
                      m.status === "UP" ? "text-signal" : m.status === "DOWN" ? "text-incident" : "text-degraded"
                    }>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono mono-tabular text-text-secondary">{m.uptimePercent.toFixed(2)}%</td>
                  <td className="px-4 py-3 font-mono mono-tabular text-text-secondary">{m.responseTimeMs ?? "—"}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
              }
