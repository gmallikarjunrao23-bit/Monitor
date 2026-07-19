import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const [user, monitors, activeIncidents, recentIncidents] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.monitor.findMany({ where: { userId } }),
    prisma.incident.count({
      where: { monitor: { userId }, status: { not: "RESOLVED" } },
    }),
    prisma.incident.findMany({
      where: { monitor: { userId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { monitor: { select: { name: true } } },
    }),
  ]);

  const monitorIds = monitors.map((m) => m.id);

  // overall uptime = average of each monitor's uptimePercent
  const overallUptime =
    monitors.length > 0
      ? Number((monitors.reduce((sum, m) => sum + m.uptimePercent, 0) / monitors.length).toFixed(2))
      : 100;

  // avg response time from last 24h of checks
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentChecks = await prisma.check.findMany({
    where: { monitorId: { in: monitorIds }, checkedAt: { gte: since24h }, responseTimeMs: { not: null } },
    select: { responseTimeMs: true, checkedAt: true },
    orderBy: { checkedAt: "asc" },
  });

  const avgResponseTime =
    recentChecks.length > 0
      ? Math.round(recentChecks.reduce((sum, c) => sum + (c.responseTimeMs ?? 0), 0) / recentChecks.length)
      : 0;

  // bucket response times by hour for chart
  const buckets: Record<string, number[]> = {};
  for (const c of recentChecks) {
    const hour = `${c.checkedAt.getHours().toString().padStart(2, "0")}:00`;
    if (!buckets[hour]) buckets[hour] = [];
    buckets[hour].push(c.responseTimeMs ?? 0);
  }
  const responseTimeChart = Object.entries(buckets).map(([time, values]) => ({
    time,
    ms: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
  }));

  // severity breakdown (last 30 days)
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const incidentsBySeverity = await prisma.incident.groupBy({
    by: ["severity"],
    where: { monitor: { userId }, createdAt: { gte: since30d } },
    _count: true,
  });
  const severityBreakdown = ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => ({
    severity: sev.charAt(0) + sev.slice(1).toLowerCase(),
    count: incidentsBySeverity.find((s) => s.severity === sev)?._count ?? 0,
  }));

  const recentActivity = recentIncidents.map((inc) => ({
    id: inc.id,
    monitorName: inc.monitor.name,
    status: inc.status,
    message: inc.aiSummary ?? inc.title,
    time: timeAgo(inc.createdAt),
  }));

  return NextResponse.json({
    overallUptime,
    activeIncidents,
    avgResponseTime,
    monitorCount: monitors.length,
    monitorLimit: user?.monitorLimit ?? 5,
    responseTimeChart,
    severityBreakdown,
    recentActivity,
    monitors: monitors.map((m) => ({
      id: m.id,
      name: m.name,
      target: m.target,
      status: m.status,
      uptimePercent: m.uptimePercent,
    })),
  });
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
