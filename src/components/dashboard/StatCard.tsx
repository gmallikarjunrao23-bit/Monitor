import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  trend?: { value: string; positive: boolean };
  accent?: "signal" | "incident" | "degraded" | "default";
  icon?: LucideIcon;
}

const ACCENT_TEXT = { signal: "text-signal", incident: "text-incident", degraded: "text-degraded", default: "text-text-primary" };
const ACCENT_BG = { signal: "bg-signal/10", incident: "bg-incident/10", degraded: "bg-degraded/10", default: "bg-white/5" };

export function StatCard({ label, value, trend, accent = "default", icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-card border border-border bg-surface p-5 transition-colors hover:border-border-subtle hover:bg-surface-hover">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{label}</p>
        {Icon && (
          <div className={`rounded-md p-1.5 ${ACCENT_BG[accent]}`}>
            <Icon size={14} className={ACCENT_TEXT[accent]} />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={`font-mono text-2xl font-medium mono-tabular ${ACCENT_TEXT[accent]}`}>{value}</span>
        {trend && (
          <span className={`text-xs font-mono ${trend.positive ? "text-signal" : "text-incident"}`}>
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
