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

async function sendEmail(to: string, payload: NotifyPayload) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) {
    throw new Error("BREVO_API_KEY or BREVO_SENDER_EMAIL not set — email disabled");
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: "InfraOps" },
      to: [{ email: to }],
      subject: payload.title,
      htmlContent: `<div style="font-family:sans-serif;background:#0B0E14;color:#E8EAED;padding:24px;border-radius:10px">
        <h2 style="color:${payload.severity === "critical" ? "#FF6B4A" : "#3DD9C4"}">${payload.title}</h2>
        <p>${payload.message}</p>
      </div>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${text}`);
  }

  console.log(`[email] sent to ${to} via Brevo`);
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
