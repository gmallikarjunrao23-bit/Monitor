import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { PLANS, PlanKey } from "@/lib/plans";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const plan = formData.get("plan") as PlanKey;
  const screenshot = formData.get("screenshot") as File | null;

  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  if (!screenshot) {
    return NextResponse.json({ error: "Screenshot required" }, { status: 400 });
  }
  if (screenshot.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "Screenshot must be under 4MB" }, { status: 400 });
  }

  const bytes = await screenshot.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const screenshotUrl = `data:${screenshot.type};base64,${base64}`;

  const payment = await prisma.payment.create({
    data: {
      userId: (session.user as any).id,
      plan,
      amountInr: PLANS[plan].priceInr,
      screenshotUrl,
      status: "PENDING",
    },
  });

  return NextResponse.json({ payment }, { status: 201 });
}
