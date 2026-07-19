import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

interface SSLCardProps {
  isValid: boolean;
  issuer: string | null;
  validTo: string | null;
  daysLeft: number | null;
}

export function SSLCard({ isValid, issuer, validTo, daysLeft }: SSLCardProps) {
  const critical = daysLeft !== null && daysLeft <= 7;
  const warning = daysLeft !== null && daysLeft <= 30 && !critical;

  const Icon = !isValid ? ShieldX : critical ? ShieldAlert : warning ? ShieldAlert : ShieldCheck;
  const color = !isValid || critical ? "text-incident" : warning ? "text-degraded" : "text-signal";
  const bg = !isValid || critical ? "bg-incident/10" : warning ? "bg-degraded/10" : "bg-signal/10";

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="flex items-center gap-2">
        <div className={`rounded-md p-1.5 ${bg}`}>
          <Icon size={14} className={color} />
        </div>
        <h2 className="font-display text-sm font-medium text-text-primary">SSL Certificate</h2>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-xs text-text-secondary">Status</p>
          <p className={`mt-1 font-medium ${color}`}>{isValid ? "Valid" : "Invalid"}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">Expires in</p>
          <p className={`mt-1 font-mono font-medium ${color}`}>{daysLeft !== null ? `${daysLeft} days` : "—"}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">Issuer</p>
          <p className="mt-1 text-xs text-text-primary">{issuer ?? "—"}</p>
        </div>
      </div>

      {validTo && (
        <p className="mt-3 text-xs text-text-muted">Expires on {new Date(validTo).toLocaleDateString()}</p>
      )}
    </div>
  );
}
