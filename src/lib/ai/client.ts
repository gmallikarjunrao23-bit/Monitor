import { prisma } from "@/lib/db/prisma";
import type { Monitor } from "@prisma/client";

const AI_ENDPOINT = process.env.API_URL ?? "";

async function callAI(prompt: string): Promise<string | null> {
  if (!AI_ENDPOINT) {
    console.error("API_URL env var not set — skipping AI call");
    return null;
  }

  try {
    const res = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, message: prompt }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      console.error(`AI endpoint returned ${res.status}`);
      return null;
    }

    const data = await res.json();
    return extractText(data);
  } catch (err) {
    console.error("AI call failed:", err);
    return null;
  }
}

function extractText(data: any): string | null {
  if (typeof data === "string") return data;
  return (
    data?.response ??
    data?.result ??
    data?.text ??
    data?.message ??
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.text ??
    null
  );
}

export async function analyzeIncident(monitor: Monitor, incidentId: string) {
  const recentChecks = await prisma.check.findMany({
    where: { monitorId: monitor.id },
    orderBy: { checkedAt: "desc" },
    take: 5,
  });

  const prompt = `You are an SRE incident commander. A monitor named "${monitor.name}" 
(target: ${monitor.target}, type: ${monitor.type}) just went DOWN.

Recent check history:
${recentChecks.map((c) => `- ${c.checkedAt.toISOString()}: ${c.success ? "UP" : "DOWN"} — ${c.errorMessage ?? "OK"}`).join("\n")}

Provide a JSON object with these exact keys: summary, rootCause, recommendation, impactEstimate.
Keep each field to 2-3 sentences, professional and calm tone.`;

  const aiText = await callAI(prompt);

  if (!aiText) {
    await prisma.incident.update({
      where: { id: incidentId },
      data: { aiSummary: "AI analysis unavailable — endpoint did not respond." },
    });
    return;
  }

  try {
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    await prisma.incident.update({
      where: { id: incidentId },
      data: {
        aiSummary: parsed?.summary ?? aiText,
        aiRootCause: parsed?.rootCause,
        aiRecommendation: parsed?.recommendation,
        aiImpactEstimate: parsed?.impactEstimate,
      },
    });
  } catch {
    await prisma.incident.update({
      where: { id: incidentId },
      data: { aiSummary: aiText },
    });
  }
}

export async function generatePostmortem(incidentId: string): Promise<string | null> {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: { monitor: true },
  });
  if (!incident) return null;

  const prompt = `Write a professional customer-facing postmortem for this resolved incident:
Monitor: ${incident.monitor.name}
Duration: ${incident.durationSec ? Math.floor(incident.durationSec / 60) : "?"} minutes
Root cause: ${incident.aiRootCause ?? "unknown"}
Keep it under 150 words, calm and professional tone.`;

  return callAI(prompt);
}
