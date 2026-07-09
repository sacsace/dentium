"use client";

import { OrderTrackingCard } from "@/components/account/OrderTrackingCard";
import type { OrderStatus } from "@prisma/client";

type TrackingOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: string | number | null;
  carrier: string | null;
  trackingNumber: string | null;
  shippedAt: string | null;
  createdAt: string;
};

const TRACKING_STATUSES: OrderStatus[] = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export function ShippingTrackingSection({ orders }: { orders: TrackingOrder[] }) {
  const trackable = orders.filter((o) => TRACKING_STATUSES.includes(o.status));

  if (trackable.length === 0) {
    return (
      <p className="text-brand-silver text-sm">
        No shipments in progress. Orders appear here once confirmed and prepared for delivery.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {trackable.map((order) => (
        <OrderTrackingCard key={order.id} {...order} />
      ))}
    </div>
  );
}
