import type { OrderStatus } from "@prisma/client";

export const ORDER_FULFILLMENT_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  QUOTE_REQUESTED: "Quote Requested",
  QUOTE_SENT: "Quote Sent",
  CONFIRMED: "Confirmed",
  PROCESSING: "Preparing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function formatOrderAmount(value: unknown): string {
  if (value == null || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : Number(value);
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function getCustomerName(order: {
  guestName?: string | null;
  user?: { name?: string | null } | null;
}): string {
  return order.guestName || order.user?.name || "—";
}

export function getCustomerEmail(order: {
  guestEmail?: string | null;
  user?: { email?: string | null } | null;
}): string {
  return order.guestEmail || order.user?.email || "—";
}

export type OrderListTab = "received" | "completed";

export const ORDER_TAB_RECEIVED_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "CANCELLED",
];

export const ORDER_TAB_COMPLETED_STATUSES: OrderStatus[] = ["DELIVERED"];

export const ORDER_TAB_LABELS: Record<OrderListTab, string> = {
  received: "Received Orders",
  completed: "Completed Sales",
};

export function orderMatchesTab(status: OrderStatus, tab: OrderListTab): boolean {
  if (tab === "completed") return ORDER_TAB_COMPLETED_STATUSES.includes(status);
  return ORDER_TAB_RECEIVED_STATUSES.includes(status);
}

export type OrderSearchable = {
  orderNumber: string;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  guestCompany?: string | null;
  status?: OrderStatus;
  notes?: string | null;
  user?: { name?: string | null; email?: string | null; company?: string | null } | null;
  items?: { product?: { name?: string; sku?: string | null } }[];
};

export function orderMatchesKeyword(order: OrderSearchable, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;

  const parts = [
    order.orderNumber,
    order.guestName ?? "",
    order.guestEmail ?? "",
    order.guestPhone ?? "",
    order.guestCompany ?? "",
    order.notes ?? "",
    order.user?.name ?? "",
    order.user?.email ?? "",
    order.user?.company ?? "",
    order.status ?? "",
    ORDER_STATUS_LABELS[order.status as OrderStatus] ?? "",
  ];

  for (const item of order.items ?? []) {
    parts.push(item.product?.name ?? "", item.product?.sku ?? "");
  }

  const haystack = parts.join(" ").toLowerCase();
  return trimmed.split(/\s+/).every((token) => haystack.includes(token));
}
