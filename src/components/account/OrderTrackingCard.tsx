import { getTrackingUrl, ORDER_STATUS_STEPS, getOrderStepIndex } from "@/lib/shipping";
import { formatOrderAmount } from "@/lib/order";
import type { OrderStatus } from "@prisma/client";

type OrderTrackingProps = {
  orderNumber: string;
  status: OrderStatus;
  totalAmount?: string | number | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  createdAt: string;
};

export function OrderTrackingCard({
  orderNumber,
  status,
  totalAmount,
  carrier,
  trackingNumber,
  shippedAt,
  createdAt,
}: OrderTrackingProps) {
  const stepIndex = getOrderStepIndex(status);
  const trackingUrl = getTrackingUrl(carrier, trackingNumber);

  return (
    <div className="bg-brand-gray p-5 rounded-xl space-y-4">
      <div className="flex flex-wrap justify-between gap-2">
        <div>
          <p className="font-medium text-brand-navy">{orderNumber}</p>
          <p className="text-brand-silver text-sm">{new Date(createdAt).toLocaleDateString()} · {status}</p>
        </div>
        {totalAmount != null && (
          <p className="text-brand-deep font-medium">{formatOrderAmount(totalAmount)}</p>
        )}
      </div>

      {status !== "CANCELLED" && (
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUS_STEPS.map((step, idx) => (
            <div
              key={step.key}
              className={`text-xs px-2 py-1 rounded-full ${
                idx <= stepIndex ? "bg-brand-accent text-brand-navy font-medium" : "bg-white text-brand-silver"
              }`}
            >
              {step.label}
            </div>
          ))}
        </div>
      )}

      {(carrier || trackingNumber) && (
        <div className="text-sm border-t border-white/60 pt-3 space-y-1">
          {carrier && <p><span className="text-brand-silver">Carrier:</span> {carrier}</p>}
          {trackingNumber && (
            <p>
              <span className="text-brand-silver">Tracking:</span>{" "}
              {trackingUrl ? (
                <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="text-brand-deep hover:underline font-medium">
                  {trackingNumber}
                </a>
              ) : (
                trackingNumber
              )}
            </p>
          )}
          {shippedAt && (
            <p className="text-brand-silver text-xs">Shipped {new Date(shippedAt).toLocaleDateString()}</p>
          )}
        </div>
      )}
    </div>
  );
}
