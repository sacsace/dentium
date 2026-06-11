import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const { name, email, phone, company, message, items } = await req.json();

    if (!name || !email || !items?.length) {
      return NextResponse.json({ error: "Name, email, and items are required" }, { status: 400 });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      const unitPrice = product.price != null ? Number(product.price) : 0;
      totalAmount += unitPrice * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    if (orderItems.length === 0) {
      return NextResponse.json({ error: "At least one valid product is required" }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session?.id,
        guestName: name,
        guestEmail: email,
        guestPhone: phone,
        guestCompany: company,
        notes: message,
        totalAmount: totalAmount > 0 ? totalAmount : null,
        status: "PENDING",
        items: { create: orderItems },
      },
    });

    return NextResponse.json({ success: true, orderNumber: order.orderNumber });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
