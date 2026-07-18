import { prisma } from "@/lib/db/prisma";
import { runHttpCheck, runPingCheck, runTcpCheck, runDnsCheck, runSslCheck } from "./checks";
import { analyzeIncident } from "@/lib/ai/client";
import { sendNotification } from "@/lib/notifications/dispatch";
import type { Monitor } from "@prisma/client";

const FAILURE_THRESHOLD = 2; // consecutive fails before opening an incident

export async function executeMonitorCheck(monitor: Monitor) {
  let result;

  switch (monitor.type) {
    case "HTTP":
    case "HTTPS":
    case "API":
    case "KEYWORD":
      result = await runHttpCheck(monitor.target, {
        method: monitor.method,
        timeoutSec: monitor.timeoutSec,
        expectedStatusCodes: monitor.expectedStatusCodes,
        expectedKeyword: monitor.expectedKeyword ?? undefined,
        unexpectedKeyword: monitor.unexpectedKeyword ?? undefined,
        headers: (monitor.requestHeaders as Record<string, string>) ?? undefined,
        body: monitor.requestBody ?? undefined,
      });
      break;
    case "PING":
      result = await runPingCheck(monitor.target);
      break;
    case "TCP": {
      const [host, portStr] = monitor.target.split(":");
      result = await runTcpCheck(host, Number(portStr ?? 80), monitor.timeoutSec);
      break;
    }
    case "DNS":
      result = await runDnsCheck(monitor.target);
      break;
    default:
      result = await runHttpCheck(monitor.target, { timeoutSec: monitor.timeoutSec });
  }

  // Retry logic for failures before declaring down
  if (!result.success && monitor.retryCount > 0) {
    for (let i = 0; i < monitor.retryCount; i++) {
      await new Promise((r) => setTimeout(r, monitor.retryDelaySec * 1000));
      const retryResult = await runHttpCheck(monitor.target, { timeoutSec: monitor.timeoutSec });
      if (retryResult.success) {
        result = retryResult;
        break;
      }
    }
  }

  await prisma.check.create({
    data: {
      monitorId: monitor.id,
      success: result.success,
      statusCode: result.statusCode,
      responseTimeMs: result.responseTimeMs,
      errorMessage: result.errorMessage,
      region: monitor.region,
    },
  });

  // SSL check (only for HTTPS-type monitors, run less frequently is fine to run every time for now)
  if (monitor.sslCheck && (monitor.type === "HTTPS" || monitor.type === "API")) {
    try {
      const hostname = new URL(monitor.target).hostname;
      const sslResult = await runSslCheck(hostname);
      await prisma.sSLCertificate.upsert({
        where: { monitorId: monitor.id },
        create: {
          monitorId: monitor.id,
          issuer: sslResult.issuer,
          validFrom: sslResult.validFrom,
          validTo: sslResult.validTo,
          daysLeft: sslResult.daysLeft,
          isValid: sslResult.isValid,
        },
        update: {
          issuer: sslResult.issuer,
          validFrom: sslResult.validFrom,
          validTo: sslResult.validTo,
          daysLeft: sslResult.daysLeft,
          isValid: sslResult.isValid,
        },
      });
    } catch {
      // invalid URL / non-HTTPS target — skip SSL check silently
    }
  }

  await updateMonitorStatus(monitor, result.success);
  await recalculateUptime(monitor.id);
}

async function updateMonitorStatus(monitor: Monitor, success: boolean) {
  if (success) {
    if (monitor.status === "DOWN" || monitor.status === "DEGRADED") {
      await resolveOpenIncident(monitor.id);
    }
    await prisma.monitor.update({
      where: { id: monitor.id },
      data: { status: "UP", lastCheckedAt: new Date() },
    });
    return;
  }

  // Check recent consecutive failures before flipping to DOWN
  const recentChecks = await prisma.check.findMany({
    where: { monitorId: monitor.id },
    orderBy: { checkedAt: "desc" },
    take: FAILURE_THRESHOLD,
  });

  const allFailed =
    recentChecks.length >= FAILURE_THRESHOLD &&
    recentChecks.every((c) => !c.success);

  if (allFailed && monitor.status !== "DOWN") {
    await prisma.monitor.update({
      where: { id: monitor.id },
      data: { status: "DOWN", lastCheckedAt: new Date() },
    });
    await openIncident(monitor);
  } else {
    await prisma.monitor.update({
      where: { id: monitor.id },
      data: { lastCheckedAt: new Date() },
    });
  }
}

async function openIncident(monitor: Monitor) {
  const incident = await prisma.incident.create({
    data: {
      monitorId: monitor.id,
      title: `${monitor.name} is DOWN`,
      status: "INVESTIGATING",
      severity: monitor.priority === "CRITICAL" ? "CRITICAL" : "HIGH",
    },
  });

  // Fire-and-forget AI analysis — never block the check loop on AI latency
  analyzeIncident(monitor, incident.id).catch((err) =>
    console.error("AI analysis failed:", err)
  );

  await sendNotification(monitor.userId, {
    title: `🔴 ${monitor.name} is DOWN`,
    message: `Monitor "${monitor.name}" (${monitor.target}) stopped responding.`,
    severity: "critical",
  });
}

async function resolveOpenIncident(monitorId: string) {
  const openIncident = await prisma.incident.findFirst({
    where: { monitorId, status: { not: "RESOLVED" } },
    orderBy: { createdAt: "desc" },
  });

  if (!openIncident) return;

  const resolvedAt = new Date();
  const durationSec = Math.floor(
    (resolvedAt.getTime() - openIncident.startedAt.getTime()) / 1000
  );

  await prisma.incident.update({
    where: { id: openIncident.id },
    data: { status: "RESOLVED", resolvedAt, durationSec },
  });

  const monitor = await prisma.monitor.findUnique({ where: { id: monitorId } });
  if (monitor) {
    await sendNotification(monitor.userId, {
      title: `✅ ${monitor.name} recovered`,
      message: `Monitor "${monitor.name}" is back up after ${Math.floor(durationSec / 60)} min.`,
      severity: "info",
    });
  }
}

async function recalculateUptime(monitorId: string) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // last 30 days
  const checks = await prisma.check.findMany({
    where: { monitorId, checkedAt: { gte: since } },
    select: { success: true },
  });

  if (checks.length === 0) return;

  const successCount = checks.filter((c) => c.success).length;
  const uptimePercent = Number(((successCount / checks.length) * 100).toFixed(2));

  await prisma.monitor.update({
    where: { id: monitorId },
    data: { uptimePercent },
  });
}
