"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DataPoint {
  time: string;
  ms: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 shadow-lg">
      <p className="font-mono text-xs text-text-muted">{label}</p>
      <p className="font-mono text-sm font-medium text-signal">{payload[0].value}ms</p>
    </div>
  );
}

export function ResponseTimeChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="responseTimeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3DD9C4" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#3DD9C4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#171B24" />
        <XAxis dataKey="time" tick={{ fill: "#5A6172", fontSize: 11 }} axisLine={{ stroke: "#1E2430" }} tickLine={false} />
        <YAxis tick={{ fill: "#5A6172", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#1E2430" }} />
        <Area type="monotone" dataKey="ms" stroke="#3DD9C4" strokeWidth={2} fill="url(#responseTimeFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
