import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

const RANGE_HOURS: Record<string, number> = { "24h": 24, "7d": 24 * 7, "30d": 24 * 30, "90d": 24 * 90 };

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const url = new URL(req.url);
  const range = url.searchParams.get("range") ?? "24h";
  const hours = RANGE_HOURS[range] ?? 24;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const monitors = await prisma.monitor.findMany({ where: { userId } });
  const monitorIds = monitors.map((m) => m.id);

  const checks = await prisma.check.findMany({
    where: { monitorId: { in: monitorIds }, checkedAt: { gte: since } },
    orderBy: { checkedAt: "asc" },
  });

  const responseTimes = checks.filter((c) => c.responseTimeMs != null).map((c) => c.responseTimeMs as number);
  const fastest = responseTimes.length ? Math.min(...responseTimes) : 0;
  const slowest = responseTimes.length ? Math.max(...responseTimes) : 0;
  const sorted = [...responseTimes].sort((a, b) => a - b);
  const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 0;

  // bucket into hourly (24h) or daily (7d/30d/90d) points
  const bucketByDay = hours > 24;
  const buckets: Record<string, number[]> = {};
  for (const c of checks) {
    if (c.responseTimeMs == null) continue;
    const key = bucketByDay
      ? c.checkedAt.toISOString().slice(0, 10)
      : `${c.checkedAt.getHours().toString().padStart(2, "0")}:00`;
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(c.responseTimeMs);
  }
  const responseTimeChart = Object.entries(buckets).map(([time, values]) => ({
    time,
    ms: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
  }));

  const incidents = await prisma.incident.findMany({
    where: { monitor: { userId }, createdAt: { gte: since } },
  });
  const severityBreakdown = ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => ({
    severity: sev.charAt(0) + sev.slice(1).toLowerCase(),
    count: incidents.filter((i) => i.severity === sev).length,
  }));

  const uptimeTrend =
    monitors.length > 0
      ? Number((monitors.reduce((sum, m) => sum + m.uptimePercent, 0) / monitors.length).toFixed(2))
      : 100;

  const uptimeDays = Array.from({ length: Math.min(45, Math.ceil(hours / 24) || 1) }, (_, i) => {
    const day = new Date(Date.now() - (44 - i) * 24 * 60 * 60 * 1000);
    const dayKey = day.toISOString().slice(0, 10);
    const dayChecks = checks.filter((c) => c.checkedAt.toISOString().slice(0, 10) === dayKey);
    const uptimePercent = dayChecks.length
      ? Number(((dayChecks.filter((c) => c.success).length / dayChecks.length) * 100).toFixed(1))
      : 100;
    return { date: dayKey, uptimePercent };
  });

  return NextResponse.json({
    fastest,
    slowest,
    p95,
    uptimeTrend,
    responseTimeChart,
    severityBreakdown,
    uptimeDays,
    hasData: checks.length > 0,
  });
}
