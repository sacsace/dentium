import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";
import { ORDER_FULFILLMENT_STATUSES } from "@/lib/order";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, sku: true, brand: true } },
        },
      },
      user: { select: { id: true, name: true, email: true, phone: true, company: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const { status } = await req.json();

  if (!ORDER_FULFILLMENT_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: status as OrderStatus },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, sku: true, brand: true } },
        },
      },
      user: { select: { id: true, name: true, email: true, phone: true, company: true } },
    },
  });

  return NextResponse.json(order);
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, orderNumber: true, status: true },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (order.status !== "DELIVERED") {
    return NextResponse.json(
      { error: "Only completed (delivered) sales can be deleted." },
      { status: 409 }
    );
  }

  await prisma.order.delete({ where: { id } });

  return NextResponse.json({ success: true, orderNumber: order.orderNumber });
}
