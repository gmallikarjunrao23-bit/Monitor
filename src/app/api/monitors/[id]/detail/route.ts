import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const monitor = await prisma.monitor.findUnique({
    where: { id },
    include: {
      checks: { orderBy: { checkedAt: "desc" }, take: 20 },
      incidents: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!monitor || monitor.userId !== (session.user as any).id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ monitor });
}
