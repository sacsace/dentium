import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { validateCouponCode } from "@/lib/order-pricing";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const { code, subtotal, productIds } = await req.json();
    const amount = Number(subtotal);

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ error: "Valid subtotal is required" }, { status: 400 });
    }

    const cartProductIds = Array.isArray(productIds)
      ? productIds.filter((id: unknown) => typeof id === "string")
      : [];

    const result = await validateCouponCode(code, amount, {
      userId: session?.id,
      cartProductIds,
    });
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      code: result.code,
      discountAmount: result.discountAmount,
      subtotal: result.subtotal,
      total: result.total,
      discountType: result.discountType,
      discountValue: result.discountValue,
      freeShipping: result.freeShipping,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
