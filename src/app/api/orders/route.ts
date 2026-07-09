import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateCartPricing, type CartLineInput } from "@/lib/order-pricing";
import { generateOrderNumber } from "@/lib/utils";
import { canSeeProductPrices } from "@/lib/membership";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const { name, email, phone, company, message, items, couponCode, quoteOnly } = await req.json();

    if (!name || !email || !items?.length) {
      return NextResponse.json({ error: "Name, email, and items are required" }, { status: 400 });
    }

    if (!quoteOnly && !canSeeProductPrices(session)) {
      return NextResponse.json({ error: "Full membership required to place orders" }, { status: 403 });
    }

    const orderItemsInput = items as { productId?: string; variantId?: string; quantity?: number }[];
    const lines: CartLineInput[] = orderItemsInput
      .filter((item) => item.productId)
      .map((item) => ({
        productId: item.productId!,
        variantId: item.variantId || null,
        quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
      }));

    if (lines.length === 0) {
      return NextResponse.json({ error: "At least one valid product is required" }, { status: 400 });
    }

    const pricing = await calculateCartPricing({
      lines,
      couponCode: couponCode || null,
      userId: session?.id,
    });

    if (couponCode && pricing.couponBlocked) {
      return NextResponse.json({ error: pricing.couponBlockedReason || "Coupon not allowed" }, { status: 400 });
    }
    if (couponCode && !pricing.couponCode) {
      return NextResponse.json({ error: "Invalid or inapplicable coupon code" }, { status: 400 });
    }

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: session?.id,
          guestName: name,
          guestEmail: email,
          guestPhone: phone,
          guestCompany: company,
          notes: message,
          subtotalAmount: pricing.subtotal > 0 ? pricing.subtotal : null,
          promotionDiscount: pricing.promotionDiscount > 0 ? pricing.promotionDiscount : null,
          discountAmount: pricing.couponDiscount > 0 ? pricing.couponDiscount : null,
          taxAmount: pricing.taxAmount > 0 ? pricing.taxAmount : null,
          shippingAmount: pricing.shippingAmount > 0 ? pricing.shippingAmount : null,
          couponCode: pricing.couponCode,
          totalAmount: pricing.total > 0 ? pricing.total : null,
          status: "PENDING",
          items: {
            create: pricing.lines.map((line) => ({
              productId: line.productId,
              variantId: line.variantId,
              variantLabel: line.variantLabel,
              quantity: line.quantity,
              price: line.unitPrice > 0 ? line.unitPrice : null,
              gstRate: line.gstRate,
              taxAmount: line.taxAmount > 0 ? line.taxAmount : null,
            })),
          },
        },
      });

      if (pricing.couponCode) {
        await tx.coupon.update({
          where: { code: pricing.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      return created;
    });

    return NextResponse.json({ success: true, orderNumber: order.orderNumber });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
