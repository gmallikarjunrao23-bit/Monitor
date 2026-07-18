import { StatCard } from "@/components/dashboard/StatCard";
import { MonitorCard } from "@/components/monitors/MonitorCard";
import { PulseLine } from "@/components/dashboard/PulseLine";
import { ResponseTimeChart } from "@/components/dashboard/ResponseTimeChart";
import { UptimeBarStrip } from "@/components/dashboard/UptimeBarStrip";
import { IncidentSeverityBars } from "@/components/dashboard/IncidentSeverityBars";
import { IncidentTimeline } from "@/components/dashboard/IncidentTimeline";
import { Activity, AlertTriangle, Gauge, LayoutGrid } from "lucide-react";

// Replace all MOCK_* with real data fetched from prisma (server component — call directly)
const MOCK_MONITORS = [
  { id: "1", name: "api.myapp.com", target: "https://api.myapp.com/health", status: "UP" as const, uptimePercent: 99.98, responseTimeMs: 142 },
  { id: "2", name: "checkout-service", target: "https://checkout.myapp.com", status: "DEGRADED" as const, uptimePercent: 98.2, responseTimeMs: 890 },
  { id: "3", name: "auth-db", target: "10.0.4.12:5432", status: "DOWN" as const, uptimePercent: 94.1 },
];

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

const MOCK_TIMELINE = [
  { id: "1", monitorName: "auth-db", status: "INVESTIGATING" as const, message: "Connection refused on port 5432", time: "2m ago" },
  { id: "2", monitorName: "checkout-service", status: "MONITORING" as const, message: "Response times elevated, watching recovery", time: "18m ago" },
  { id: "3", monitorName: "api.myapp.com", status: "RESOLVED" as const, message: "Recovered after 4 min outage", time: "1h ago" },
];

export default function DashboardPage() {
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
        <StatCard label="Overall uptime" value="99.94%" accent="signal" icon={Gauge} trend={{ value: "0.02%", positive: true }} />
        <StatCard label="Active incidents" value="1" accent="incident" icon={AlertTriangle} />
        <StatCard label="Avg response time" value="184ms" accent="default" icon={Activity} trend={{ value: "12ms", positive: false }} />
        <StatCard label="Monitors" value="3 / 5" accent="default" icon={LayoutGrid} />
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="col-span-2 rounded-card border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-medium text-text-primary">Response time (24h)</h2>
            <span className="font-mono text-xs text-text-muted">avg 184ms</span>
          </div>
          <div className="h-52">
            <ResponseTimeChart data={MOCK_RESPONSE_TIME} />
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface p-5">
          <h2 className="mb-4 font-display text-sm font-medium text-text-primary">Incidents by severity</h2>
          <div className="h-52">
            <IncidentSeverityBars data={MOCK_SEVERITY} />
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="col-span-2 rounded-card border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-medium text-text-primary">45-day uptime</h2>
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-signal" /> Up</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-degraded" /> Degraded</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-incident" /> Down</span>
            </div>
          </div>
          <UptimeBarStrip days={MOCK_UPTIME_DAYS} />
        </div>

        <div className="rounded-card border border-border bg-surface p-5">
          <h2 className="mb-4 font-display text-sm font-medium text-text-primary">Recent activity</h2>
          <IncidentTimeline events={MOCK_TIMELINE} />
        </div>
      </div>

      <h2 className="mb-4 font-display text-sm font-medium uppercase tracking-wide text-text-secondary">Monitors</h2>
      <div className="grid grid-cols-3 gap-4">
        {MOCK_MONITORS.map((m) => (
          <MonitorCard key={m.id} {...m} />
        ))}
      </div>
    </div>
  );
}
