import { prisma } from "@/lib/db/prisma";

interface NotifyPayload {
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
}

export async function sendNotification(userId: string, payload: NotifyPayload) {
  const channels = await prisma.notificationChannel.findMany({
    where: { userId, isActive: true },
  });

  console.log(`[notify] found ${channels.length} channel(s) for user ${userId}`);

  const results = await Promise.allSettled(
    channels.map((channel) => {
      switch (channel.type) {
        case "EMAIL":
          return sendEmail(channel.target, payload);
        case "TELEGRAM":
          return sendTelegram(channel.target, payload);
        case "WEBHOOK":
          return sendWebhook(channel.target, payload);
        case "DISCORD":
          return sendDiscordWebhook(channel.target, payload);
        default:
          return Promise.resolve();
      }
    })
  );

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[notify] channel ${channels[i]?.type} to ${channels[i]?.target} FAILED:`, r.reason);
    } else {
      console.log(`[notify] channel ${channels[i]?.type} to ${channels[i]?.target} sent OK`);
    }
  });
}

// Uses Resend's HTTP API instead of raw SMTP — cloud hosts like Railway
// block outbound SMTP ports (587/465), but HTTPS API calls work fine.
async function sendEmail(to: string, payload: NotifyPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY not set — email disabled");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "InfraOps <onboarding@resend.dev>",
      to: [to],
      subject: payload.title,
      html: `<div style="font-family:sans-serif;background:#0B0E14;color:#E8EAED;padding:24px;border-radius:10px">
        <h2 style="color:${payload.severity === "critical" ? "#FF6B4A" : "#3DD9C4"}">${payload.title}</h2>
        <p>${payload.message}</p>
      </div>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error ${res.status}: ${text}`);
  }

  console.log(`[email] sent to ${to} via Resend`);
}

async function sendTelegram(chatId: string, payload: NotifyPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: `*${payload.title}*\n${payload.message}`,
      parse_mode: "Markdown",
    }),
  });
}

async function sendWebhook(url: string, payload: NotifyPayload) {
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function sendDiscordWebhook(url: string, payload: NotifyPayload) {
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: `**${payload.title}**\n${payload.message}` }),
  });
}
