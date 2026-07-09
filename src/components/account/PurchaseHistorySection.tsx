"use client";

import type { OrderStatus } from "@prisma/client";
import { formatDate, formatPrice } from "@/lib/utils";
import { formatOrderAmount } from "@/lib/order";

export type AccountOrderItem = {
  quantity: number;
  price: string | number | null;
  variantLabel: string | null;
  product: { name: string };
};

export type AccountOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: string | number | null;
  subtotalAmount: string | number | null;
  taxAmount: string | number | null;
  shippingAmount: string | number | null;
  couponCode: string | null;
  createdAt: string;
  items: AccountOrderItem[];
};

export function PurchaseHistorySection({ orders }: { orders: AccountOrder[] }) {
  if (orders.length === 0) {
    return <p className="text-brand-silver text-sm">No orders yet. Browse products to place your first order.</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <article key={order.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-gray-100 bg-brand-gray/40">
            <div>
              <p className="font-semibold text-brand-navy">{order.orderNumber}</p>
              <p className="text-brand-silver text-sm mt-0.5">
                {formatDate(order.createdAt)} · {order.status.replace(/_/g, " ")}
              </p>
            </div>
            {order.totalAmount != null && (
              <p className="text-brand-deep font-semibold">{formatOrderAmount(order.totalAmount)}</p>
            )}
          </div>

          <ul className="divide-y divide-gray-50 px-5">
            {order.items.map((item, idx) => (
              <li key={idx} className="py-3 flex justify-between gap-4 text-sm">
                <div>
                  <p className="font-medium text-brand-navy">{item.product.name}</p>
                  {item.variantLabel && <p className="text-brand-silver text-xs mt-0.5">{item.variantLabel}</p>}
                  <p className="text-brand-silver text-xs mt-0.5">Qty {item.quantity}</p>
                </div>
                {item.price != null && (
                  <p className="text-brand-navy shrink-0">{formatPrice(Number(item.price) * item.quantity)}</p>
                )}
              </li>
            ))}
          </ul>

          <div className="px-5 py-3 bg-brand-gray/30 text-xs text-brand-silver flex flex-wrap gap-x-4 gap-y-1">
            {order.subtotalAmount != null && <span>Subtotal {formatOrderAmount(order.subtotalAmount)}</span>}
            {order.taxAmount != null && Number(order.taxAmount) > 0 && (
              <span>GST {formatOrderAmount(order.taxAmount)}</span>
            )}
            {order.shippingAmount != null && (
              <span>Shipping {Number(order.shippingAmount) === 0 ? "Free" : formatOrderAmount(order.shippingAmount)}</span>
            )}
            {order.couponCode && <span>Coupon {order.couponCode}</span>}
          </div>
        </article>
      ))}
    </div>
  );
}
