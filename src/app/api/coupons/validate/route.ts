import { NextRequest, NextResponse } from "next/server";
import { validateCouponCode } from "@/lib/coupon";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    const amount = Number(subtotal);

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ error: "Valid subtotal is required" }, { status: 400 });
    }

    const result = await validateCouponCode(code, amount);
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
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
