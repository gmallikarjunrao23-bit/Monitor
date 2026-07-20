import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, role } = await req.json();

  const invitedUser = await prisma.user.findUnique({ where: { email } });
  if (!invitedUser) {
    return NextResponse.json({ error: "No user found with that email — they must sign up first" }, { status: 404 });
  }

  const existing = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: invitedUser.id, teamId: id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already a member" }, { status: 409 });
  }

  const member = await prisma.teamMember.create({
    data: { userId: invitedUser.id, teamId: id, role: role ?? "VIEWER" },
  });

  return NextResponse.json({ member }, { status: 201 });
}
