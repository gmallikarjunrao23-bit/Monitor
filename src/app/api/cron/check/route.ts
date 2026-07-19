import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { executeMonitorCheck } from "@/lib/monitoring/engine";

export async function GET(req: Request) {
  // simple shared-secret protection so randoms can't trigger checks
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (secret !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const monitors = await prisma.monitor.findMany({ where: { isPaused: false } });

  const now = Date.now();
  const due = monitors.filter((m) => {
    if (!m.lastCheckedAt) return true;
    const elapsed = (now - m.lastCheckedAt.getTime()) / 1000;
    return elapsed >= m.checkIntervalSec;
  });

  const results = await Promise.allSettled(due.map((m) => executeMonitorCheck(m)));
  const succeeded = results.filter((r) => r.status === "fulfilled").length;

  return NextResponse.json({ checked: due.length, succeeded });
}
