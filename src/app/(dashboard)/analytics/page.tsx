"use client";

import { useState } from "react";
import { ResponseTimeChart } from "@/components/dashboard/ResponseTimeChart";
import { IncidentSeverityBars } from "@/components/dashboard/IncidentSeverityBars";
import { UptimeBarStrip } from "@/components/dashboard/UptimeBarStrip";
import { StatCard } from "@/components/dashboard/StatCard";
import { Gauge, Activity, TrendingUp, Zap } from "lucide-react";

const RANGES = ["24h", "7d", "30d", "90d"];

const MOCK_RESPONSE_TIME = [
  { time: "00:00", ms: 120 }, { time: "04:00", ms: 135 }, { time: "08:00", ms: 210 },
  { time: "12:00", ms: 890 }, { time: "16:00", ms: 340 }, { time: "20:00", ms: 165 }, { time: "24:00", ms: 142 },
];

const MOCK_SEVERITY = [
  { severity: "Critical", count: 1 }, { severity: "High", count: 3 },
  { severity: "Medium", count: 5 }, { severity: "Low", count: 2 },
];

const MOCK_UPTIME_DAYS = Array.from({ length: 45 }, (_, i) => ({
  date: `Day ${i + 1}`,
  uptimePercent: i === 20 ? 62 : i === 21 ? 78 : Math.random() > 0.05 ? 100 : 96,
}));

export default function AnalyticsPage() {
  const [range, setRange] = useState("24h");

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

      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard label="Fastest monitor" value="38ms" accent="signal" icon={Zap} />
        <StatCard label="Slowest monitor" value="890ms" accent="degraded" icon={Activity} />
        <StatCard label="P95 response" value="620ms" accent="default" icon={Gauge} />
        <StatCard label="Uptime trend" value="+0.4%" accent="signal" icon={TrendingUp} trend={{ value: "vs last period", positive: true }} />
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="col-span-2 rounded-card border border-border bg-surface p-5">
          <h2 className="mb-4 font-display text-sm font-medium text-text-primary">Response time ({range})</h2>
          <div className="h-64">
            <ResponseTimeChart data={MOCK_RESPONSE_TIME} />
          </div>
        </div>
        <div className="rounded-card border border-border bg-surface p-5">
          <h2 className="mb-4 font-display text-sm font-medium text-text-primary">Incidents by severity</h2>
          <div className="h-64">
            <IncidentSeverityBars data={MOCK_SEVERITY} />
          </div>
        </div>
      </div>

      <div className="rounded-card border border-border bg-surface p-5">
        <h2 className="mb-4 font-display text-sm font-medium text-text-primary">45-day uptime history</h2>
        <UptimeBarStrip days={MOCK_UPTIME_DAYS} />
      </div>
    </div>
  );
}
