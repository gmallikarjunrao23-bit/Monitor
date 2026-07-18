"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const SEVERITY_COLOR: Record<string, string> = {
  Critical: "#FF6B4A",
  High: "#F5B841",
  Medium: "#3DD9C4",
  Low: "#5A6172",
};

interface SeverityDatum {
  severity: string;
  count: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 shadow-lg">
      <p className="font-mono text-xs text-text-muted">{label}</p>
      <p className="font-mono text-sm font-medium text-text-primary">{payload[0].value} incidents</p>
    </div>
  );
}

export function IncidentSeverityBars({ data }: { data: SeverityDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#171B24" />
        <XAxis dataKey="severity" tick={{ fill: "#5A6172", fontSize: 11 }} axisLine={{ stroke: "#1E2430" }} tickLine={false} />
        <YAxis tick={{ fill: "#5A6172", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#171B24" }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={SEVERITY_COLOR[d.severity] ?? "#3DD9C4"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
