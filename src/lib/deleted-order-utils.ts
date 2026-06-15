import type { OrderStatus } from "@prisma/client";
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
