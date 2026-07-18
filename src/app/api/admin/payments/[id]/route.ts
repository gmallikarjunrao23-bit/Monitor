import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { PLANS, PlanKey } from "@/lib/plans";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session?.user || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action, note } = await req.json(); // action: "approve" | "reject"

  const payment = await prisma.payment.findUnique({ where: { id: params.id } });
  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }
  if (payment.status !== "PENDING") {
    return NextResponse.json({ error: "Payment already reviewed" }, { status: 409 });
  }

  const updated = await prisma.payment.update({
    where: { id: params.id },
    data: {
      status: action === "approve" ? "APPROVED" : "REJECTED",
      adminNote: note,
      reviewedBy: (session.user as any).id,
      reviewedAt: new Date(),
    },
  });

  if (action === "approve") {
    const planKey = payment.plan as PlanKey;
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // 30-day billing cycle

    await prisma.user.update({
      where: { id: payment.userId },
      data: {
        plan: payment.plan,
        planExpiresAt: expires,
        monitorLimit: PLANS[planKey].monitorLimit,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: `payment_${action}`,
      metadata: { paymentId: payment.id, targetUser: payment.userId },
    },
  });

  return NextResponse.json({ payment: updated });
}
