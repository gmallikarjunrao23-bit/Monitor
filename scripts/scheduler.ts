import { prisma } from "@/lib/db/prisma";
import { executeMonitorCheck } from "@/lib/monitoring/engine";

const POLL_INTERVAL_MS = 15_000; // check every 15s which monitors are due

async function tick() {
  try {
    const monitors = await prisma.monitor.findMany({
      where: { isPaused: false },
    });

    const now = Date.now();
    const due = monitors.filter((m) => {
      if (!m.lastCheckedAt) return true;
      const elapsed = (now - m.lastCheckedAt.getTime()) / 1000;
      return elapsed >= m.checkIntervalSec;
    });

    await Promise.allSettled(due.map((m) => executeMonitorCheck(m)));

    if (due.length > 0) {
      console.log(`[scheduler] ran ${due.length} checks at ${new Date().toISOString()}`);
    }
  } catch (err) {
    console.error("[scheduler] tick error:", err);
  }
}

console.log("🐺 InfraOps scheduler started");
setInterval(tick, POLL_INTERVAL_MS);
tick();
