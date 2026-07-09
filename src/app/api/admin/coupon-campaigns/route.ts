import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { processDueCouponCampaigns } from "@/lib/coupon-email";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await processDueCouponCampaigns();

  const campaigns = await prisma.couponEmailCampaign.findMany({
    include: { coupon: { select: { code: true, discountType: true, discountValue: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(campaigns);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const couponId = typeof data.couponId === "string" ? data.couponId : "";
  const subject = typeof data.subject === "string" ? data.subject.trim() : "";
  const segment = data.segment || "ALL_USERS";
  const userIds = Array.isArray(data.userIds) ? data.userIds.filter((id: unknown) => typeof id === "string") : [];
  const message = typeof data.message === "string" ? data.message.trim() : null;
  const sendNow = Boolean(data.sendNow);
  const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;

  if (!couponId || !subject) {
    return NextResponse.json({ error: "Coupon and subject are required" }, { status: 400 });
  }

  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });

  const campaign = await prisma.couponEmailCampaign.create({
    data: {
      couponId,
      subject,
      segment,
      userIds,
      message,
      scheduledAt: sendNow ? null : scheduledAt,
      status: sendNow ? "SCHEDULED" : scheduledAt ? "SCHEDULED" : "SCHEDULED",
    },
    include: { coupon: { select: { code: true, discountType: true, discountValue: true } } },
  });

  if (sendNow) {
    const { sendCouponCampaign } = await import("@/lib/coupon-email");
    try {
      const result = await sendCouponCampaign(campaign.id);
      const updated = await prisma.couponEmailCampaign.findUnique({
        where: { id: campaign.id },
        include: { coupon: { select: { code: true, discountType: true, discountValue: true } } },
      });
      return NextResponse.json({ ...updated, sendResult: result });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to send", campaign },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(campaign, { status: 201 });
}
