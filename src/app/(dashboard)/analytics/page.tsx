"use client";

import { useEffect, useState } from "react";
import { ResponseTimeChart } from "@/components/dashboard/ResponseTimeChart";
import { IncidentSeverityBars } from "@/components/dashboard/IncidentSeverityBars";
import { UptimeBarStrip } from "@/components/dashboard/UptimeBarStrip";
import { StatCard } from "@/components/dashboard/StatCard";
import { Gauge, Activity, TrendingUp, Zap } from "lucide-react";

const RANGES = ["24h", "7d", "30d", "90d"];

interface AnalyticsData {
  fastest: number;
  slowest: number;
  p95: number;
  uptimeTrend: number;
  responseTimeChart: { time: string; ms: number }[];
  severityBreakdown: { severity: string; count: number }[];
  uptimeDays: { date: string; uptimePercent: number }[];
  hasData: boolean;
}

export default function AnalyticsPage() {
  const [range, setRange] = useState("24h");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?range=${range}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Analytics</h1>
          <p className="mt-1 text-sm text-text-secondary">Performance trends across your infrastructure</p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                range === r ? "bg-signal/10 text-signal" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <p className="text-sm text-text-muted">Loading...</p>
      ) : !data.hasData ? (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border py-20 text-center">
          <p className="text-sm text-text-secondary">No check data yet for this range</p>
          <p className="mt-1 text-xs text-text-muted">Once your monitors run checks, analytics will populate here.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-4 gap-4">
            <StatCard label="Fastest check" value={`${data.fastest}ms`} accent="signal" icon={Zap} />
            <StatCard label="Slowest check" value={`${data.slowest}ms`} accent="degraded" icon={Activity} />
            <StatCard label="P95 response" value={`${data.p95}ms`} accent="default" icon={Gauge} />
            <StatCard label="Avg uptime" value={`${data.uptimeTrend}%`} accent="signal" icon={TrendingUp} />
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="col-span-2 rounded-card border border-border bg-surface p-5">
              <h2 className="mb-4 font-display text-sm font-medium text-text-primary">Response time ({range})</h2>
              <div className="h-64">
                {data.responseTimeChart.length > 0 ? (
                  <ResponseTimeChart data={data.responseTimeChart} />
                ) : (
                  <p className="flex h-full items-center justify-center text-sm text-text-muted">No response time data</p>
                )}
              </div>
            </div>
            <div className="rounded-card border border-border bg-surface p-5">
              <h2 className="mb-4 font-display text-sm font-medium text-text-primary">Incidents by severity</h2>
              <div className="h-64">
                <IncidentSeverityBars data={data.severityBreakdown} />
              </div>
            </div>
          </div>

          <div className="rounded-card border border-border bg-surface p-5">
            <h2 className="mb-4 font-display text-sm font-medium text-text-primary">Uptime history</h2>
            <UptimeBarStrip days={data.uptimeDays} />
          </div>
        </>
      )}
    </div>
  );
}
