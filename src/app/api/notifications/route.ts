import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const createSchema = z.object({
  type: z.enum(["EMAIL", "TELEGRAM", "DISCORD", "SLACK", "WEBHOOK", "TEAMS"]),
  target: z.string().min(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const channels = await prisma.notificationChannel.findMany({
    where: { userId: (session.user as any).id },
  });
  return NextResponse.json({ channels });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const channel = await prisma.notificationChannel.create({
    data: { userId: (session.user as any).id, type: parsed.data.type, target: parsed.data.target },
  });

  return NextResponse.json({ channel }, { status: 201 });
}
