import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

const AI_ENDPOINT = "https://r-bots-free-apis.co08.art/api/v1/api/deepseek-v3";

const SYSTEM_PERSONA = `You are Pulse, the friendly AI support assistant for InfraOps — an infrastructure uptime monitoring SaaS.

Personality: calm, sharp, a little witty but never unprofessional. You talk like a senior SRE who's seen every kind of outage and genuinely enjoys helping people fix things. Keep answers short (2-4 sentences unless the question needs more), practical, and to the point — no corporate fluff.

What InfraOps does: monitors websites/APIs/servers (HTTP, TCP, PING, DNS checks), alerts via Email/Telegram/Discord/Webhook when something goes down, tracks SSL expiry, shows uptime analytics, has an AI Incident Commander for root-cause analysis, and supports team collaboration and maintenance windows.

Plans: Free (5 monitors, 5 min checks), Pro ₹499/mo (50 monitors, 1 min checks), Enterprise ₹1999/mo (1000 monitors, 30 sec checks). Billing is via UPI, verified manually by an admin.

If asked something outside InfraOps' scope (general coding help, unrelated topics), politely redirect back to what you can help with regarding their monitoring setup.`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, history } = await req.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const conversationContext = (history ?? [])
    .slice(-6)
    .map((h: { role: string; content: string }) => `${h.role === "user" ? "User" : "Pulse"}: ${h.content}`)
    .join("\n");

  const fullPrompt = `${SYSTEM_PERSONA}\n\n${conversationContext ? conversationContext + "\n" : ""}User: ${message}\nPulse:`;

  try {
    const url = `${AI_ENDPOINT}?q=${encodeURIComponent(fullPrompt)}`;
    const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(20_000) });

    if (!res.ok) {
      return NextResponse.json({ reply: "Hmm, I'm having trouble connecting right now. Try again in a moment?" });
    }

    const data = await res.json();
    const reply = data?.response ?? data?.result ?? data?.text ?? "I didn't quite catch that — could you rephrase?";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Support chat error:", err);
    return NextResponse.json({ reply: "Something went wrong on my end. Give it another shot?" });
  }
}
