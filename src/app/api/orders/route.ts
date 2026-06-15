import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { validateCouponCode } from "@/lib/coupon";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const { name, email, phone, company, message, items, couponCode } = await req.json();

    if (!name || !email || !items?.length) {
      return NextResponse.json({ error: "Name, email, and items are required" }, { status: 400 });
    }

    const orderItemsInput = items as { productId?: string; quantity?: number }[];
    const productIds = Array.from(
      new Set(
        orderItemsInput
          .map((item) => item.productId)
          .filter((id): id is string => typeof id === "string" && id.length > 0)
      )
    );
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    });
    const productMap = new Map(products.map((product) => [product.id, product]));

    let subtotal = 0;
    const orderItems: { productId: string; quantity: number; price: Prisma.Decimal | null }[] = [];

    for (const item of orderItemsInput) {
      if (!item.productId) continue;
      const product = productMap.get(item.productId);
      if (!product) continue;
      const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
      const unitPrice = product.price != null ? Number(product.price) : 0;
      subtotal += unitPrice * quantity;
      orderItems.push({
        productId: item.productId,
        quantity,
        price: product.price,
      });
    }

    if (orderItems.length === 0) {
      return NextResponse.json({ error: "At least one valid product is required" }, { status: 400 });
    }

    let discountAmount = 0;
    let appliedCouponCode: string | null = null;
    let totalAmount = subtotal;

    if (couponCode && subtotal > 0) {
      const validation = await validateCouponCode(couponCode, subtotal);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      discountAmount = validation.discountAmount;
      totalAmount = validation.total;
      appliedCouponCode = validation.code;
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
          subtotalAmount: subtotal > 0 ? subtotal : null,
          discountAmount: discountAmount > 0 ? discountAmount : null,
          couponCode: appliedCouponCode,
          totalAmount: totalAmount > 0 ? totalAmount : null,
          status: "PENDING",
          items: { create: orderItems },
        },
      });

      if (appliedCouponCode) {
        await tx.coupon.update({
          where: { code: appliedCouponCode },
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
