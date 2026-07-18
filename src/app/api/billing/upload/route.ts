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

  // Upload screenshot to your storage of choice (S3 / Cloudinary / Railway volume)
  // and get back a URL. Placeholder below stores a data reference — swap in
  // real upload logic before going live.
  const screenshotUrl = await uploadScreenshot(screenshot);

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

async function uploadScreenshot(file: File): Promise<string> {
  // TODO: implement real storage upload (S3/Cloudinary/Railway volume)
  // Returning a placeholder path for now.
  const bytes = await file.arrayBuffer();
  const filename = `${Date.now()}-${file.name}`;
  return `/uploads/payments/${filename}`;
}
