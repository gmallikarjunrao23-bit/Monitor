"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { MonitorCard } from "@/components/monitors/MonitorCard";
import { PulseLine } from "@/components/dashboard/PulseLine";
import { ResponseTimeChart } from "@/components/dashboard/ResponseTimeChart";
import { IncidentSeverityBars } from "@/components/dashboard/IncidentSeverityBars";
import { IncidentTimeline } from "@/components/dashboard/IncidentTimeline";
import { Activity, AlertTriangle, Gauge, LayoutGrid } from "lucide-react";

interface DashboardData {
  overallUptime: number;
  activeIncidents: number;
  avgResponseTime: number;
  monitorCount: number;
  monitorLimit: number;
  responseTimeChart: { time: string; ms: number }[];
  severityBreakdown: { severity: string; count: number }[];
  recentActivity: { id: string; monitorName: string; status: any; message: string; time: string }[];
  monitors: { id: string; name: string; target: string; status: any; uptimePercent: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-sm text-text-muted">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="p-8 text-sm text-incident">Failed to load dashboard data.</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Overview</h1>
          <p className="mt-1 text-sm text-text-secondary">Live health across all monitored infrastructure</p>
        </div>
        <div className="h-10 w-40 opacity-80">
          <PulseLine status="up" className="h-full w-full" />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard label="Overall uptime" value={`${data.overallUptime}%`} accent="signal" icon={Gauge} />
        <StatCard label="Active incidents" value={String(data.activeIncidents)} accent={data.activeIncidents > 0 ? "incident" : "default"} icon={AlertTriangle} />
        <StatCard label="Avg response time" value={`${data.avgResponseTime}ms`} accent="default" icon={Activity} />
        <StatCard label="Monitors" value={`${data.monitorCount} / ${data.monitorLimit}`} accent="default" icon={LayoutGrid} />
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="col-span-2 rounded-card border border-border bg-surface p-5">
          <h2 className="mb-4 font-display text-sm font-medium text-text-primary">Response time (24h)</h2>
          <div className="h-52">
            {data.responseTimeChart.length > 0 ? (
              <ResponseTimeChart data={data.responseTimeChart} />
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-text-muted">No check data yet</p>
            )}
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface p-5">
          <h2 className="mb-4 font-display text-sm font-medium text-text-primary">Incidents by severity</h2>
          <div className="h-52">
            <IncidentSeverityBars data={data.severityBreakdown} />
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-card border border-border bg-surface p-5">
        <h2 className="mb-4 font-display text-sm font-medium text-text-primary">Recent activity</h2>
        {data.recentActivity.length === 0 ? (
          <p className="text-sm text-text-muted">No incidents yet — everything's quiet.</p>
        ) : (
          <IncidentTimeline events={data.recentActivity} />
        )}
      </div>

      <h2 className="mb-4 font-display text-sm font-medium uppercase tracking-wide text-text-secondary">Monitors</h2>
      {data.monitors.length === 0 ? (
        <p className="text-sm text-text-muted">No monitors yet. Add one from the Monitors page.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {data.monitors.map((m) => (
            <MonitorCard key={m.id} {...m} />
          ))}
        </div>
      )}
    </div>
  );
}
