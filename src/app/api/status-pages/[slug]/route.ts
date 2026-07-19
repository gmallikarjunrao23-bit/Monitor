import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const page = await prisma.statusPage.findUnique({ where: { slug } });
  if (!page || !page.isPublic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const monitors = await prisma.monitor.findMany({
    where: { id: { in: page.monitorIds } },
    select: { id: true, name: true, status: true, uptimePercent: true },
  });

  const overallStatus = monitors.some((m) => m.status === "DOWN")
    ? "DOWN"
    : monitors.some((m) => m.status === "DEGRADED")
    ? "DEGRADED"
    : "UP";

  return NextResponse.json({
    title: page.title,
    description: page.description,
    monitors,
    overallStatus,
  });
}
