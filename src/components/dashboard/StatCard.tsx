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
const ACCENT_RING = { signal: "group-hover:ring-signal/20", incident: "group-hover:ring-incident/20", degraded: "group-hover:ring-degraded/20", default: "group-hover:ring-white/10" };

export function StatCard({ label, value, trend, accent = "default", icon: Icon }: StatCardProps) {
  return (
    <div className={`group rounded-card border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-border-subtle hover:shadow-card-hover hover:ring-1 ${ACCENT_RING[accent]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{label}</p>
        {Icon && (
          <div className={`rounded-md p-1.5 transition-transform group-hover:scale-110 ${ACCENT_BG[accent]}`}>
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
