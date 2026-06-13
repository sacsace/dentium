import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";
import { ORDER_FULFILLMENT_STATUSES } from "@/lib/order";
import { archiveAndDeleteOrder } from "@/lib/deleted-order";

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

  try {
    const orderNumber = await archiveAndDeleteOrder(id, session.email);
    return NextResponse.json({ success: true, orderNumber });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    if (message === "Not found") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
