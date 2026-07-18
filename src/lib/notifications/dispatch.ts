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

  await Promise.allSettled(
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
}

async function sendEmail(to: string, payload: NotifyPayload) {
  // Wire up nodemailer/SMTP creds via env vars: SMTP_HOST, SMTP_USER, SMTP_PASS
  console.log(`[email → ${to}]`, payload.title);
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
