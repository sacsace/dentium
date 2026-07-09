import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { normalizeCouponCode } from "@/lib/coupon-utils";
import { parseCouponPayload } from "@/lib/coupon-admin";

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
  const parsed = parseCouponPayload(data);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
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

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
