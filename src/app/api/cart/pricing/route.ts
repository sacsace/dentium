import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { calculateCartPricing, type CartLineInput } from "@/lib/order-pricing";
import { canSeeProductPrices } from "@/lib/membership";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!canSeeProductPrices(session)) {
      return NextResponse.json({ error: "Full membership required to view cart pricing" }, { status: 403 });
    }
    const body = await req.json();
    const items = Array.isArray(body.items) ? body.items : [];
    const couponCode = typeof body.couponCode === "string" ? body.couponCode : null;

    const lines: CartLineInput[] = items
      .filter((item: { productId?: string; quantity?: number }) => item?.productId)
      .map((item: { productId: string; variantId?: string; quantity?: number }) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
      }));

    const pricing = await calculateCartPricing({
      lines,
      couponCode,
      userId: session?.id,
    });

    return NextResponse.json(pricing);
  } catch {
    return NextResponse.json({ error: "Failed to calculate pricing" }, { status: 500 });
  }
}
