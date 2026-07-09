import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sendCouponCampaign } from "@/lib/coupon-email";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const result = await sendCouponCampaign(id);
    const campaign = await prisma.couponEmailCampaign.findUnique({
      where: { id },
      include: { coupon: { select: { code: true, discountType: true, discountValue: true } } },
    });
    return NextResponse.json({ campaign, result });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Send failed" }, { status: 500 });
  }
}
