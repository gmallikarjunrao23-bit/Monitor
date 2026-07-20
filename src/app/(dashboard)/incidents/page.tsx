"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Search } from "lucide-react";

interface IncidentItem {
  id: string;
  monitorName: string;
  status: string;
  severity: string;
  message: string;
  time: string;
}

interface IncidentData {
  incidents: IncidentItem[];
  activeCount: number;
  resolvedCount: number;
  avgResolutionMin: number;
}

const TABS = ["All", "Active", "Resolved"];

const STATUS_STYLE: Record<string, string> = {
  INVESTIGATING: "text-incident bg-incident/10 border-incident/30",
  IDENTIFIED: "text-degraded bg-degraded/10 border-degraded/30",
  MONITORING: "text-degraded bg-degraded/10 border-degraded/30",
  RESOLVED: "text-signal bg-signal/10 border-signal/30",
};

export default function IncidentsPage() {
  const [data, setData] = useState<IncidentData | null>(null);
  const [tab, setTab] = useState("All");
  const [acking, setAcking] = useState<string | null>(null);

  async function fetchData() {
    const res = await fetch("/api/incidents");
    setData(await res.json());
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleAcknowledge(id: string) {
    setAcking(id);
    await fetch(`/api/incidents/${id}/acknowledge`, { method: "POST" });
    await fetchData();
    setAcking(null);
  }

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

      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-card border border-dashed border-border py-12 text-center">
            <p className="text-sm text-text-muted">No incidents in this view.</p>
          </div>
        ) : (
          filtered.map((inc) => (
            <div key={inc.id} className="rounded-card border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLE[inc.status] ?? ""}`}>
                      {inc.status}
                    </span>
                    <p className="text-sm font-medium text-text-primary">{inc.monitorName}</p>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">{inc.message}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="font-mono text-xs text-text-muted">{inc.time}</span>
                  {inc.status === "INVESTIGATING" && (
                    <button
                      onClick={() => handleAcknowledge(inc.id)}
                      disabled={acking === inc.id}
                      className="rounded-md border border-degraded/40 px-2.5 py-1 text-[11px] font-medium text-degraded hover:bg-degraded/10 disabled:opacity-50"
                    >
                      {acking === inc.id ? "..." : "Acknowledge"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
