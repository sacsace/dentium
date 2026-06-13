import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ORDER_TAB_RECEIVED_STATUSES } from "@/lib/order";

const ACTIVE_ORDER_STATUSES = ORDER_TAB_RECEIVED_STATUSES.filter(
  (status) => status !== "CANCELLED"
) as OrderStatus[];

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      shortDesc: data.shortDesc,
      sku: data.sku,
      price: data.price ? parseFloat(data.price) : null,
      showPrice: data.showPrice,
      brand: data.brand,
      tags: data.tags,
      images: data.images,
      specifications: data.specifications,
      features: data.features,
      isFeatured: data.isFeatured,
      isNew: data.isNew,
      isActive: data.isActive,
      categoryId: data.categoryId,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      orderItems: {
        select: {
          orderId: true,
          order: { select: { status: true } },
        },
      },
    },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const activeOrderIds = new Set(
    product.orderItems
      .filter((item) => ACTIVE_ORDER_STATUSES.includes(item.order.status))
      .map((item) => item.orderId)
  );

  if (activeOrderIds.size > 0) {
    return NextResponse.json(
      {
        error: `"${product.name}" cannot be deleted because it is linked to ${activeOrderIds.size} active order(s). Complete or cancel those orders first, or deactivate the product instead.`,
      },
      { status: 409 }
    );
  }

  const affectedOrderIds = [...new Set(product.orderItems.map((item) => item.orderId))];

  await prisma.$transaction(async (tx) => {
    await tx.quoteItem.deleteMany({ where: { productId: id } });
    await tx.orderItem.deleteMany({ where: { productId: id } });

    for (const orderId of affectedOrderIds) {
      const remaining = await tx.orderItem.count({ where: { orderId } });
      if (remaining === 0) {
        await tx.order.delete({ where: { id: orderId } });
      }
    }

    await tx.product.delete({ where: { id } });
  });

  return NextResponse.json({ success: true });
}
