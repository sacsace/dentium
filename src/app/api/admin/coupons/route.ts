import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { normalizeCouponCode, generateCouponCode } from "@/lib/coupon-utils";
import { parseCouponPayload } from "@/lib/coupon-admin";

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
  const parsed = parseCouponPayload(data);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code,
      description: data.description || null,
      discountType: parsed.discountType,
      discountValue: parsed.discountValue,
      minOrderAmount: data.minOrderAmount != null && data.minOrderAmount !== "" ? Number(data.minOrderAmount) : null,
      maxUses: data.maxUses != null && data.maxUses !== "" ? Number(data.maxUses) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      freeShipping: parsed.freeShipping,
      productIds: parsed.productIds,
      allowedUserIds: parsed.allowedUserIds,
      isActive: data.isActive ?? true,
    },
  });

  return NextResponse.json(coupon);
}
