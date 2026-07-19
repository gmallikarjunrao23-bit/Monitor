import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const monitor = await prisma.monitor.findUnique({ where: { id } });
  if (!monitor || monitor.userId !== (session.user as any).id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.monitor.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const monitor = await prisma.monitor.findUnique({ where: { id } });
  if (!monitor || monitor.userId !== (session.user as any).id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, any> = {};

  if (typeof body.isPaused === "boolean") data.isPaused = body.isPaused;
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.target === "string" && body.target.trim()) data.target = body.target.trim();
  if (typeof body.checkIntervalSec === "number") data.checkIntervalSec = body.checkIntervalSec;

  const updated = await prisma.monitor.update({ where: { id }, data });
  return NextResponse.json({ monitor: updated });
}
