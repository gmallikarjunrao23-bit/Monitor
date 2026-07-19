import { Shield, Calendar, Activity, Bell, AlertTriangle } from "lucide-react";

interface ProfileCardProps {
  name: string;
  email: string;
  role: string;
  plan: string;
  joinedAt: string;
  monitorCount: number;
  monitorLimit: number;
  incidentCount: number;
  channelCount: number;
}

const PLAN_STYLE: Record<string, string> = {
  FREE: "border-border text-text-secondary",
  PRO: "border-signal/40 text-signal bg-signal/5",
  ENTERPRISE: "border-degraded/40 text-degraded bg-degraded/5",
};

export function ProfileCard({
  name, email, role, plan, joinedAt, monitorCount, monitorLimit, incidentCount, channelCount,
}: ProfileCardProps) {
  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-signal/15 font-display text-xl font-medium text-signal">
            {name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <h2 className="font-display text-lg font-medium text-text-primary">{name}</h2>
            <p className="text-sm text-text-secondary">{email}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${PLAN_STYLE[plan] ?? PLAN_STYLE.FREE}`}>
            {plan} PLAN
          </span>
          {(role === "ADMIN" || role === "SUPER_ADMIN") && (
            <span className="flex items-center gap-1 rounded-full border border-incident/40 bg-incident/5 px-2.5 py-1 text-xs font-medium text-incident">
              <Shield size={11} /> {role.replace("_", " ")}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-1.5 text-xs text-text-muted">
        <Calendar size={12} />
        Joined {joinedAt}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border-subtle pt-5">
        <div>
          <div className="flex items-center gap-1.5 text-text-muted">
            <Activity size={12} />
            <span className="text-xs">Monitors</span>
          </div>
          <p className="mt-1 font-mono text-lg font-medium mono-tabular text-text-primary">
            {monitorCount}<span className="text-sm text-text-muted">/{monitorLimit}</span>
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-text-muted">
            <AlertTriangle size={12} />
            <span className="text-xs">Incidents</span>
          </div>
          <p className="mt-1 font-mono text-lg font-medium mono-tabular text-text-primary">{incidentCount}</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-text-muted">
            <Bell size={12} />
            <span className="text-xs">Channels</span>
          </div>
          <p className="mt-1 font-mono text-lg font-medium mono-tabular text-text-primary">{channelCount}</p>
        </div>
      </div>
    </div>
  );
}
