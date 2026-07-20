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

  const updated = await prisma.incident.update({
    where: { id },
    data: { status: "IDENTIFIED" },
  });

  await prisma.incidentUpdate.create({
    data: { incidentId: id, message: `Acknowledged by ${session.user.name ?? "a team member"}` },
  });

  return NextResponse.json({ incident: updated });
}
