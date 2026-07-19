import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { executeMonitorCheck } from "@/lib/monitoring/engine";
import { PLANS, PlanKey } from "@/lib/plans";

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
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const currentCount = await prisma.monitor.count({ where: { userId } });
  if (currentCount >= user.monitorLimit) {
    return NextResponse.json(
      { error: `Monitor limit reached (${user.monitorLimit}). Upgrade your plan to add more.` },
      { status: 403 }
    );
  }

  // enforce the fastest interval allowed by the user's plan
  const planKey = user.plan as PlanKey;
  const minInterval = PLANS[planKey]?.checkIntervalSec ?? 300;
  const requestedInterval = parsed.data.checkIntervalSec ?? minInterval;

  if (requestedInterval < minInterval) {
    return NextResponse.json(
      { error: `Your ${planKey} plan allows checks no faster than every ${minInterval}s.` },
      { status: 403 }
    );
  }

  const monitor = await prisma.monitor.create({
    data: {
      userId,
      name: parsed.data.name,
      target: parsed.data.target,
      type: parsed.data.type,
      checkIntervalSec: requestedInterval,
    },
  });

  try {
    await executeMonitorCheck(monitor);
  } catch (err) {
    console.error("Initial check failed:", err);
  }

  const updated = await prisma.monitor.findUnique({ where: { id: monitor.id } });
  return NextResponse.json({ monitor: updated }, { status: 201 });
}
