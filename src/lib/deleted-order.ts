import { prisma } from "@/lib/prisma";
import type { DeletedOrderItemSnapshot } from "@/lib/deleted-order-utils";

export type { DeletedOrderItemSnapshot, DeletedOrderSearchable } from "@/lib/deleted-order-utils";

export async function archiveAndDeleteOrder(orderId: string, deletedBy?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { select: { name: true, slug: true, sku: true } },
        },
      },
      user: { select: { name: true, email: true, phone: true, company: true } },
    },
  });

  if (!order) {
    throw new Error("Not found");
  }

  const items: DeletedOrderItemSnapshot[] = order.items.map((item) => ({
    productName: item.product.name,
    sku: item.product.sku,
    quantity: item.quantity,
    price: item.price != null ? String(item.price) : null,
    slug: item.product.slug,
  }));

  const customerName = order.guestName || order.user?.name || null;
  const customerEmail = order.guestEmail || order.user?.email || null;

  await prisma.$transaction(async (tx) => {
    await tx.deletedOrder.create({
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        guestName: order.guestName,
        guestEmail: order.guestEmail,
        guestPhone: order.guestPhone ?? order.user?.phone ?? null,
        guestCompany: order.guestCompany ?? order.user?.company ?? null,
        customerName,
        customerEmail,
        notes: order.notes,
        subtotalAmount: order.subtotalAmount,
        discountAmount: order.discountAmount,
        couponCode: order.couponCode,
        totalAmount: order.totalAmount,
        items,
        orderCreatedAt: order.createdAt,
        deletedBy: deletedBy ?? null,
      },
    });

    await tx.order.delete({ where: { id: orderId } });
  });

  return order.orderNumber;
}
