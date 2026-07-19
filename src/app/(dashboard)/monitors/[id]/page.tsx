"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { PulseLine } from "@/components/dashboard/PulseLine";

interface MonitorDetail {
  id: string;
  name: string;
  target: string;
  type: string;
  status: "UP" | "DOWN" | "DEGRADED" | "PENDING" | "MAINTENANCE";
  uptimePercent: number;
  checkIntervalSec: number;
  createdAt: string;
  checks: { id: string; success: boolean; statusCode: number | null; responseTimeMs: number | null; checkedAt: string; errorMessage: string | null }[];
  incidents: { id: string; title: string; status: string; createdAt: string }[];
}

const STATUS_COLOR: Record<string, string> = {
  UP: "text-signal", DOWN: "text-incident", DEGRADED: "text-degraded", PENDING: "text-text-muted", MAINTENANCE: "text-degraded",
};

export default function MonitorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<MonitorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/monitors/${params.id}/detail`)
      .then((r) => r.json())
      .then((d) => setData(d.monitor ?? null))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleDelete() {
    if (!confirm("Delete this monitor? This cannot be undone.")) return;
    await fetch(`/api/monitors/${params.id}`, { method: "DELETE" });
    router.push("/monitors");
  }

  if (loading) return <div className="p-8 text-sm text-text-muted">Loading...</div>;
  if (!data) return <div className="p-8 text-sm text-incident">Monitor not found.</div>;

  return (
    <div className="p-8">
      <button onClick={() => router.push("/monitors")} className="mb-4 flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft size={14} /> Back to Monitors
      </button>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${data.status === "UP" ? "bg-signal" : data.status === "DOWN" ? "bg-incident" : "bg-degraded"}`} />
            <h1 className="font-display text-2xl font-semibold text-text-primary">{data.name}</h1>
          </div>
          <p className="mt-1 font-mono text-sm text-text-muted">{data.target}</p>
        </div>
        <button onClick={handleDelete} className="flex items-center gap-1 rounded-md border border-incident/40 px-3 py-1.5 text-xs font-medium text-incident hover:bg-incident/10">
          <Trash2 size={14} /> Delete
        </button>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Status</p>
          <p className={`mt-1 font-mono text-lg font-medium ${STATUS_COLOR[data.status]}`}>{data.status}</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Uptime</p>
          <p className="mt-1 font-mono text-lg font-medium mono-tabular text-text-primary">{data.uptimePercent.toFixed(2)}%</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Type</p>
          <p className="mt-1 font-mono text-lg font-medium text-text-primary">{data.type}</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Check interval</p>
          <p className="mt-1 font-mono text-lg font-medium text-text-primary">{data.checkIntervalSec}s</p>
        </div>
      </div>

      <div className="mb-6 rounded-card border border-border bg-surface p-5">
        <h2 className="mb-4 font-display text-sm font-medium text-text-primary">Pulse</h2>
        <div className="h-16">
          <PulseLine status={data.status === "UP" ? "up" : data.status === "DOWN" ? "down" : "degraded"} animated={data.status === "UP"} className="h-full w-full" />
        </div>
      </div>

      <div className="rounded-card border border-border bg-surface p-5">
        <h2 className="mb-4 font-display text-sm font-medium text-text-primary">Recent checks</h2>
        {data.checks.length === 0 ? (
          <p className="text-sm text-text-muted">No checks recorded yet. The scheduler runs checks periodically once it's deployed and running.</p>
        ) : (
          <div className="space-y-2">
            {data.checks.map((c) => (
              <div key={c.id} className="flex items-center justify-between border-b border-border-subtle py-2 text-sm last:border-0">
                <span className={c.success ? "text-signal" : "text-incident"}>{c.success ? "UP" : "DOWN"}</span>
                <span className="font-mono text-xs text-text-muted">{c.statusCode ?? "—"}</span>
                <span className="font-mono text-xs text-text-secondary">{c.responseTimeMs ?? "—"}ms</span>
                <span className="text-xs text-text-muted">{new Date(c.checkedAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
          }
