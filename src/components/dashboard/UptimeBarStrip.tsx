interface DayStatus {
  date: string;
  uptimePercent: number; // 100 = fully up, 0 = fully down, null-ish = no data
}

function barColor(pct: number) {
  if (pct >= 99.5) return "bg-signal";
  if (pct >= 95) return "bg-degraded";
  if (pct > 0) return "bg-incident";
  return "bg-border";
}

export function UptimeBarStrip({ days }: { days: DayStatus[] }) {
  return (
    <div className="w-full">
      <div className="flex h-9 w-full gap-[3px]">
        {days.map((d, i) => (
          <div key={i} className="group relative flex-1">
            <div className={`h-9 w-full rounded-[2px] ${barColor(d.uptimePercent)} opacity-80 transition-opacity hover:opacity-100`} />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 text-xs group-hover:block">
              <span className="font-mono text-text-primary">{d.uptimePercent.toFixed(1)}%</span>
              <span className="ml-1 text-text-muted">{d.date}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-text-muted">
        <span>{days[0]?.date}</span>
        <span>Today</span>
      </div>
    </div>
  );
}
