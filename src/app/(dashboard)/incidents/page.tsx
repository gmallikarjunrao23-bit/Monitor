"use client";

import { useEffect, useState } from "react";
import { IncidentTimeline } from "@/components/dashboard/IncidentTimeline";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface IncidentData {
  incidents: { id: string; monitorName: string; status: any; message: string; time: string }[];
  activeCount: number;
  resolvedCount: number;
  avgResolutionMin: number;
}

const TABS = ["All", "Active", "Resolved"];

export default function IncidentsPage() {
  const [data, setData] = useState<IncidentData | null>(null);
  const [tab, setTab] = useState("All");

  useEffect(() => {
    fetch("/api/incidents").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="p-8 text-sm text-text-muted">Loading...</div>;

  const filtered = data.incidents.filter((e) => {
    if (tab === "All") return true;
    if (tab === "Active") return e.status !== "RESOLVED";
    return e.status === "RESOLVED";
  });

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Incidents</h1>
      <p className="mt-1 text-sm text-text-secondary">Timeline of everything that needed attention</p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-card border border-incident/30 bg-incident/5 p-4">
          <div className="flex items-center gap-2 text-incident"><AlertTriangle size={14} /><span className="text-xs font-medium">Active</span></div>
          <p className="mt-2 font-mono text-xl font-medium text-text-primary">{data.activeCount}</p>
        </div>
        <div className="rounded-card border border-signal/30 bg-signal/5 p-4">
          <div className="flex items-center gap-2 text-signal"><CheckCircle2 size={14} /><span className="text-xs font-medium">Resolved</span></div>
          <p className="mt-2 font-mono text-xl font-medium text-text-primary">{data.resolvedCount}</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-text-secondary"><Clock size={14} /><span className="text-xs font-medium">Avg. resolution</span></div>
          <p className="mt-2 font-mono text-xl font-medium text-text-primary">{data.avgResolutionMin}m</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-1 rounded-md border border-border bg-surface p-1 w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded px-3 py-1.5 text-xs font-medium ${tab === t ? "bg-signal/10 text-signal" : "text-text-secondary hover:text-text-primary"}`}>
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
