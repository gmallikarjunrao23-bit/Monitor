import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const memberships = await prisma.teamMember.findMany({
    where: { userId },
    include: { team: { include: { members: { include: { user: { select: { name: true, email: true } } } } } } },
  });

  return NextResponse.json({ teams: memberships.map((m) => m.team) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const { name } = await req.json();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);

  const team = await prisma.team.create({
    data: {
      name,
      slug,
      members: { create: { userId, role: "OWNER" } },
    },
  });

  return NextResponse.json({ team }, { status: 201 });
}
