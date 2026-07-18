import { AlertTriangle, CheckCircle2, Search } from "lucide-react";

interface TimelineEvent {
  id: string;
  monitorName: string;
  status: "INVESTIGATING" | "IDENTIFIED" | "MONITORING" | "RESOLVED";
  message: string;
  time: string;
}

const STATUS_ICON = {
  INVESTIGATING: { icon: AlertTriangle, color: "text-incident", bg: "bg-incident/10" },
  IDENTIFIED: { icon: Search, color: "text-degraded", bg: "bg-degraded/10" },
  MONITORING: { icon: Search, color: "text-degraded", bg: "bg-degraded/10" },
  RESOLVED: { icon: CheckCircle2, color: "text-signal", bg: "bg-signal/10" },
};

export function IncidentTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-0">
      {events.map((e, i) => {
        const config = STATUS_ICON[e.status];
        const Icon = config.icon;
        const isLast = i === events.length - 1;

        return (
          <div key={e.id} className="relative flex gap-3 pb-6">
            {!isLast && <div className="absolute left-[15px] top-8 h-full w-px bg-border" />}
            <div className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
              <Icon size={14} className={config.color} />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-text-primary">{e.monitorName}</p>
                <span className="shrink-0 font-mono text-xs text-text-muted">{e.time}</span>
              </div>
              <p className="mt-0.5 text-sm text-text-secondary">{e.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
