"use client";

import { useState } from "react";
import { IncidentTimeline } from "@/components/dashboard/IncidentTimeline";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const MOCK_TIMELINE = [
  { id: "1", monitorName: "auth-db", status: "INVESTIGATING" as const, message: "Connection refused on port 5432", time: "2m ago" },
  { id: "2", monitorName: "checkout-service", status: "MONITORING" as const, message: "Response times elevated, watching recovery", time: "18m ago" },
  { id: "3", monitorName: "api.myapp.com", status: "RESOLVED" as const, message: "Recovered after 4 min outage", time: "1h ago" },
  { id: "4", monitorName: "cdn-edge", status: "RESOLVED" as const, message: "Brief 502 spike, self-resolved", time: "6h ago" },
  { id: "5", monitorName: "webhook-relay", status: "RESOLVED" as const, message: "Timeout errors during deploy window", time: "1d ago" },
];

const TABS = ["All", "Active", "Resolved"];

export default function IncidentsPage() {
  const [tab, setTab] = useState("All");

  const filtered = MOCK_TIMELINE.filter((e) => {
    if (tab === "All") return true;
    if (tab === "Active") return e.status !== "RESOLVED";
    return e.status === "RESOLVED";
  });

  const activeCount = MOCK_TIMELINE.filter((e) => e.status !== "RESOLVED").length;
  const resolvedCount = MOCK_TIMELINE.filter((e) => e.status === "RESOLVED").length;
  const avgResolutionMin = 14;

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Incidents</h1>
      <p className="mt-1 text-sm text-text-secondary">Timeline of everything that needed attention</p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-card border border-incident/30 bg-incident/5 p-4">
          <div className="flex items-center gap-2 text-incident">
            <AlertTriangle size={14} />
            <span className="text-xs font-medium">Active</span>
          </div>
          <p className="mt-2 font-mono text-xl font-medium text-text-primary">{activeCount}</p>
        </div>
        <div className="rounded-card border border-signal/30 bg-signal/5 p-4">
          <div className="flex items-center gap-2 text-signal">
            <CheckCircle2 size={14} />
            <span className="text-xs font-medium">Resolved (30d)</span>
          </div>
          <p className="mt-2 font-mono text-xl font-medium text-text-primary">{resolvedCount}</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <Clock size={14} />
            <span className="text-xs font-medium">Avg. resolution</span>
          </div>
          <p className="mt-2 font-mono text-xl font-medium text-text-primary">{avgResolutionMin}m</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-1 rounded-md border border-border bg-surface p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === t ? "bg-signal/10 text-signal" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 max-w-2xl rounded-card border border-border bg-surface p-6">
        {filtered.length === 0 ? (
          <p className="text-sm text-text-muted">No incidents in this view.</p>
        ) : (
          <IncidentTimeline events={filtered} />
        )}
      </div>
    </div>
  );
            }
