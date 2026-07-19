"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { PulseLine } from "@/components/dashboard/PulseLine";

interface StatusData {
  title: string;
  description: string | null;
  overallStatus: "UP" | "DOWN" | "DEGRADED";
  monitors: { id: string; name: string; status: string; uptimePercent: number }[];
}

const STATUS_CONFIG = {
  UP: { label: "All Systems Operational", color: "text-signal", bg: "bg-signal/10", icon: CheckCircle2 },
  DEGRADED: { label: "Partial Degradation", color: "text-degraded", bg: "bg-degraded/10", icon: AlertTriangle },
  DOWN: { label: "Major Outage", color: "text-incident", bg: "bg-incident/10", icon: XCircle },
};

export default function PublicStatusPage() {
  const params = useParams();
  const [data, setData] = useState<StatusData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/status-pages/${params.slug}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() => setNotFound(true));
  }, [params.slug]);

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <p className="text-text-secondary">Status page not found.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  const config = STATUS_CONFIG[data.overallStatus];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-bg px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold text-text-primary">{data.title}</h1>
          {data.description && <p className="mt-1 text-sm text-text-secondary">{data.description}</p>}
        </div>

        <div className={`mt-8 flex items-center justify-center gap-2 rounded-card border border-border ${config.bg} py-4`}>
          <Icon size={18} className={config.color} />
          <span className={`font-medium ${config.color}`}>{config.label}</span>
        </div>

        <div className="mt-8 h-16 opacity-70">
          <PulseLine status={data.overallStatus === "UP" ? "up" : data.overallStatus === "DOWN" ? "down" : "degraded"} className="h-full w-full" />
        </div>

        <div className="mt-8 space-y-2">
          {data.monitors.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-card border border-border bg-surface p-4">
              <span className="text-sm text-text-primary">{m.name}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-text-muted">{m.uptimePercent.toFixed(2)}% uptime</span>
                <span className={`h-2 w-2 rounded-full ${
                  m.status === "UP" ? "bg-signal" : m.status === "DOWN" ? "bg-incident" : "bg-degraded"
                }`} />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-text-muted">Powered by InfraOps</p>
      </div>
    </div>
  );
}
