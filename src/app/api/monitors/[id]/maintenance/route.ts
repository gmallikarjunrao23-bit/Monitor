import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const windows = await prisma.maintenanceWindow.findMany({
    where: { monitorId: id },
    orderBy: { startTime: "desc" },
  });
  return NextResponse.json({ windows });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const monitor = await prisma.monitor.findUnique({ where: { id } });
  if (!monitor || monitor.userId !== (session.user as any).id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { title, startTime, endTime } = await req.json();
  const window = await prisma.maintenanceWindow.create({
    data: { monitorId: id, title, startTime: new Date(startTime), endTime: new Date(endTime) },
  });
  return NextResponse.json({ window }, { status: 201 });
}
