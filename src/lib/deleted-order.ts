import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABELS } from "@/lib/order";

export type DeletedOrderItemSnapshot = {
  productName: string;
  sku: string | null;
  quantity: number;
  price: string | null;
  slug?: string | null;
};

export type DeletedOrderSearchable = {
  orderNumber: string;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  guestCompany?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  status?: OrderStatus;
  notes?: string | null;
  deletedBy?: string | null;
  items?: DeletedOrderItemSnapshot[];
};

export function getDeletedOrderCustomerName(record: DeletedOrderSearchable): string {
  return record.customerName || record.guestName || "—";
}

export function getDeletedOrderCustomerEmail(record: DeletedOrderSearchable): string {
  return record.customerEmail || record.guestEmail || "—";
}

export function deletedOrderMatchesKeyword(record: DeletedOrderSearchable, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;

  const parts = [
    record.orderNumber,
    record.guestName ?? "",
    record.guestEmail ?? "",
    record.guestPhone ?? "",
    record.guestCompany ?? "",
    record.customerName ?? "",
    record.customerEmail ?? "",
    record.notes ?? "",
    record.deletedBy ?? "",
    record.status ?? "",
    ORDER_STATUS_LABELS[record.status as OrderStatus] ?? "",
  ];

  for (const item of record.items ?? []) {
    parts.push(item.productName ?? "", item.sku ?? "");
  }

  const haystack = parts.join(" ").toLowerCase();
  return trimmed.split(/\s+/).every((token) => haystack.includes(token));
}

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
