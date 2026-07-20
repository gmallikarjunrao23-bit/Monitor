"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Pencil, Pause, Play, X, Wrench } from "lucide-react";
import { PulseLine } from "@/components/dashboard/PulseLine";
import { SSLCard } from "@/components/monitors/SSLCard";
import { MaintenanceModal } from "@/components/monitors/MaintenanceModal";

interface MonitorDetail {
  id: string;
  name: string;
  target: string;
  type: string;
  status: "UP" | "DOWN" | "DEGRADED" | "PENDING" | "MAINTENANCE";
  uptimePercent: number;
  checkIntervalSec: number;
  isPaused: boolean;
  createdAt: string;
  checks: { id: string; success: boolean; statusCode: number | null; responseTimeMs: number | null; checkedAt: string; errorMessage: string | null }[];
  incidents: { id: string; title: string; status: string; createdAt: string }[];
  sslInfo: { isValid: boolean; issuer: string | null; validTo: string | null; daysLeft: number | null } | null;
}

interface MaintenanceWindow {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

const STATUS_COLOR: Record<string, string> = {
  UP: "text-signal", DOWN: "text-incident", DEGRADED: "text-degraded", PENDING: "text-text-muted", MAINTENANCE: "text-degraded",
};

export default function MonitorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<MonitorDetail | null>(null);
  const [windows, setWindows] = useState<MaintenanceWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [editName, setEditName] = useState("");
  const [editTarget, setEditTarget] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const [detailRes, maintRes] = await Promise.all([
      fetch(`/api/monitors/${params.id}/detail`),
      fetch(`/api/monitors/${params.id}/maintenance`),
    ]);
    const detail = await detailRes.json();
    setData(detail.monitor ?? null);
    if (detail.monitor) {
      setEditName(detail.monitor.name);
      setEditTarget(detail.monitor.target);
    }
    if (maintRes.ok) {
      const m = await maintRes.json();
      setWindows(m.windows ?? []);
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete() {
    if (!confirm("Delete this monitor? This cannot be undone.")) return;
    await fetch(`/api/monitors/${params.id}`, { method: "DELETE" });
    router.push("/monitors");
  }

  async function handleTogglePause() {
    if (!data) return;
    await fetch(`/api/monitors/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPaused: !data.isPaused }),
    });
    fetchData();
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/monitors/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, target: editTarget }),
    });
    setSaving(false);
    setShowEdit(false);
    fetchData();
  }

  if (loading) return <div className="p-8 text-sm text-text-muted">Loading...</div>;
  if (!data) return <div className="p-8 text-sm text-incident">Monitor not found.</div>;

  const activeWindow = windows.find((w) => new Date(w.startTime) <= new Date() && new Date(w.endTime) >= new Date());
  const upcomingWindows = windows.filter((w) => new Date(w.startTime) > new Date());

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
            {data.isPaused && (
              <span className="rounded-full border border-degraded/40 bg-degraded/10 px-2 py-0.5 text-xs font-medium text-degraded">PAUSED</span>
            )}
            {activeWindow && (
              <span className="rounded-full border border-degraded/40 bg-degraded/10 px-2 py-0.5 text-xs font-medium text-degraded">IN MAINTENANCE</span>
            )}
          </div>
          <p className="mt-1 font-mono text-sm text-text-muted">{data.target}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowMaintenance(true)} className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-hover">
            <Wrench size={14} /> Maintenance
          </button>
          <button onClick={() => setShowEdit(true)} className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-hover">
            <Pencil size={14} /> Edit
          </button>
          <button onClick={handleTogglePause} className="flex items-center gap-1 rounded-md border border-degraded/40 px-3 py-1.5 text-xs font-medium text-degraded hover:bg-degraded/10">
            {data.isPaused ? <Play size={14} /> : <Pause size={14} />} {data.isPaused ? "Resume" : "Pause"}
          </button>
          <button onClick={handleDelete} className="flex items-center gap-1 rounded-md border border-incident/40 px-3 py-1.5 text-xs font-medium text-incident hover:bg-incident/10">
            <Trash2 size={14} /> Delete
          </button>
        </div>
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

      {data.sslInfo && (
        <div className="mb-6">
          <SSLCard {...data.sslInfo} />
        </div>
      )}

      {upcomingWindows.length > 0 && (
        <div className="mb-6 rounded-card border border-degraded/30 bg-degraded/5 p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-medium text-degraded">
            <Wrench size={14} /> Upcoming Maintenance
          </h2>
          <div className="space-y-2">
            {upcomingWindows.map((w) => (
              <div key={w.id} className="flex items-center justify-between text-sm">
                <span className="text-text-primary">{w.title}</span>
                <span className="font-mono text-xs text-text-muted">
                  {new Date(w.startTime).toLocaleString()} → {new Date(w.endTime).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 rounded-card border border-border bg-surface p-5">
        <h2 className="mb-4 font-display text-sm font-medium text-text-primary">Pulse</h2>
        <div className="h-16">
          <PulseLine status={data.status === "UP" ? "up" : data.status === "DOWN" ? "down" : "degraded"} animated={data.status === "UP"} className="h-full w-full" />
        </div>
      </div>

      <div className="rounded-card border border-border bg-surface p-5">
        <h2 className="mb-4 font-display text-sm font-medium text-text-primary">Recent checks</h2>
        {data.checks.length === 0 ? (
          <p className="text-sm text-text-muted">No checks recorded yet.</p>
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

      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-card border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-medium text-text-primary">Edit Monitor</h2>
              <button onClick={() => setShowEdit(false)} className="text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-signal"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Target URL / IP</label>
                <input
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value)}
                  className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-signal"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-md bg-signal py-2.5 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showMaintenance && (
        <MaintenanceModal
          monitorId={params.id as string}
          onClose={() => setShowMaintenance(false)}
          onCreated={fetchData}
        />
      )}
    </div>
  );
}
