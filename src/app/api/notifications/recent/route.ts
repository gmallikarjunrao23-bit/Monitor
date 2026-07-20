import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const incidents = await prisma.incident.findMany({
    where: { monitor: { userId } },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { monitor: { select: { name: true } } },
  });

  const unreadCount = incidents.filter((i) => i.status !== "RESOLVED").length;

  return NextResponse.json({
    notifications: incidents.map((i) => ({
      id: i.id,
      monitorName: i.monitor.name,
      status: i.status,
      time: timeAgo(i.createdAt),
    })),
    unreadCount,
  });
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
