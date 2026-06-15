import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { normalizeCouponCode } from "@/lib/coupon-utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const data = await req.json();
  const code = normalizeCouponCode(data.code || "");
  if (!code) {
    return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
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

  const duplicate = await prisma.coupon.findFirst({
    where: { code, NOT: { id } },
  });
  if (duplicate) {
    return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
  }

  const coupon = await prisma.coupon.update({
    where: { id },
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

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
