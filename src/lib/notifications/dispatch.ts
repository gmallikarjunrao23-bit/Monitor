import nodemailer from "nodemailer";
import { prisma } from "@/lib/db/prisma";

interface NotifyPayload {
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("SMTP_HOST / SMTP_USER / SMTP_PASS not set — email disabled");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
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
  const t = getTransporter();
  if (!t) return;

  await t.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: payload.title,
    text: payload.message,
    html: `<div style="font-family:sans-serif;background:#0B0E14;color:#E8EAED;padding:24px;border-radius:10px">
      <h2 style="color:${payload.severity === "critical" ? "#FF6B4A" : "#3DD9C4"}">${payload.title}</h2>
      <p>${payload.message}</p>
    </div>`,
  });
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
