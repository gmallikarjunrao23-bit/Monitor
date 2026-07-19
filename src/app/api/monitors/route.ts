import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  target: z.string().min(1),
  type: z.enum(["HTTP", "HTTPS", "TCP", "PING", "DNS", "API"]),
  checkIntervalSec: z.number().min(30).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const monitors = await prisma.monitor.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ monitors });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const currentCount = await prisma.monitor.count({ where: { userId } });
  if (user && currentCount >= user.monitorLimit) {
    return NextResponse.json(
      { error: `Monitor limit reached (${user.monitorLimit}). Upgrade your plan to add more.` },
      { status: 403 }
    );
  }

  const monitor = await prisma.monitor.create({
    data: {
      userId,
      name: parsed.data.name,
      target: parsed.data.target,
      type: parsed.data.type,
      checkIntervalSec: parsed.data.checkIntervalSec ?? 300,
    },
  });

  return NextResponse.json({ monitor }, { status: 201 });
}
