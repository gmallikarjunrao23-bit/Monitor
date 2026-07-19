import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      image: true,
      role: true,
      plan: true,
      planExpiresAt: true,
      monitorLimit: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [monitorCount, incidentCount, channelCount] = await Promise.all([
    prisma.monitor.count({ where: { userId } }),
    prisma.incident.count({ where: { monitor: { userId } } }),
    prisma.notificationChannel.count({ where: { userId } }),
  ]);

  return NextResponse.json({ user, stats: { monitorCount, incidentCount, channelCount } });
}
