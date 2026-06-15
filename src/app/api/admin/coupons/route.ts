import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { normalizeCouponCode, generateCouponCode } from "@/lib/coupon-utils";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  let code = normalizeCouponCode(data.code || "");

  if (!code) {
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = generateCouponCode();
      const existing = await prisma.coupon.findUnique({ where: { code: candidate } });
      if (!existing) {
        code = candidate;
        break;
      }
    }
  }

  if (!code) {
    return NextResponse.json({ error: "Could not generate a unique coupon code" }, { status: 500 });
  }
  if (!data.discountType || !["PERCENT", "FIXED"].includes(data.discountType)) {
    return NextResponse.json({ error: "Invalid discount type" }, { status: 400 });
  }
  const discountValue = Number(data.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return NextResponse.json({ error: "Discount value must be greater than 0" }, { status: 400 });
  }
  if (data.discountType === "PERCENT" && discountValue > 100) {
    return NextResponse.json({ error: "Percent discount cannot exceed 100" }, { status: 400 });
  }

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code,
      description: data.description || null,
      discountType: data.discountType,
      discountValue,
      minOrderAmount: data.minOrderAmount != null && data.minOrderAmount !== "" ? Number(data.minOrderAmount) : null,
      maxUses: data.maxUses != null && data.maxUses !== "" ? Number(data.maxUses) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: data.isActive ?? true,
    },
  });

  return NextResponse.json(coupon);
}
