import Link from "next/link";
import { PulseLine } from "@/components/dashboard/PulseLine";

interface MonitorCardProps {
  id: string;
  name: string;
  target: string;
  status: "UP" | "DOWN" | "DEGRADED" | "PENDING" | "MAINTENANCE";
  uptimePercent: number;
  responseTimeMs?: number;
}

const STATUS_CONFIG = {
  UP: { label: "Operational", dot: "bg-signal", text: "text-signal", pulse: "up" as const },
  DOWN: { label: "Down", dot: "bg-incident", text: "text-incident", pulse: "down" as const },
  DEGRADED: { label: "Degraded", dot: "bg-degraded", text: "text-degraded", pulse: "degraded" as const },
  PENDING: { label: "Pending", dot: "bg-text-muted", text: "text-text-muted", pulse: "up" as const },
  MAINTENANCE: { label: "Maintenance", dot: "bg-degraded", text: "text-degraded", pulse: "degraded" as const },
};

export function MonitorCard({ id, name, target, status, uptimePercent, responseTimeMs }: MonitorCardProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Link
      href={`/monitors/${id}`}
      className="group block rounded-card border border-border bg-surface p-5 transition-all hover:border-border-subtle hover:bg-surface-hover hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${config.dot} animate-glow-pulse`} />
            <h3 className="truncate font-display text-[15px] font-medium text-text-primary">{name}</h3>
          </div>
          <p className="mt-1 truncate font-mono text-xs text-text-muted">{target}</p>
        </div>
        <span className={`shrink-0 rounded-full border border-border px-2 py-0.5 text-xs font-medium ${config.text}`}>
          {config.label}
        </span>
      </div>

      <div className="mt-4 h-[30px] w-full opacity-70 transition-opacity group-hover:opacity-100">
        <PulseLine status={config.pulse} animated={status === "UP"} className="h-full w-full" />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3 text-xs">
        <span className="font-mono text-text-secondary mono-tabular">{uptimePercent.toFixed(2)}% uptime</span>
        {responseTimeMs !== undefined && (
          <span className="font-mono text-text-secondary mono-tabular">{responseTimeMs}ms</span>
        )}
      </div>
    </Link>
  );
}
