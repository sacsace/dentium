const CARRIER_TRACKING: { match: RegExp; url: (n: string) => string }[] = [
  { match: /blue\s*dart/i, url: (n) => `https://www.bluedart.com/web/guest/trackdartresultthirdparty?trackFor=0&trackNo=${encodeURIComponent(n)}` },
  { match: /dtdc/i, url: (n) => `https://www.dtdc.in/tracking.asp?strCnno=${encodeURIComponent(n)}` },
  { match: /delhivery/i, url: (n) => `https://www.delhivery.com/track/package/${encodeURIComponent(n)}` },
  { match: /fedex/i, url: (n) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}` },
  { match: /dhl/i, url: (n) => `https://www.dhl.com/in-en/home/tracking.html?tracking-id=${encodeURIComponent(n)}` },
  { match: /india\s*post/i, url: (n) => `https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx?consignmentnumber=${encodeURIComponent(n)}` },
  { match: /ekart/i, url: (n) => `https://ekartlogistics.com/shipmenttrack/${encodeURIComponent(n)}` },
];

export const SHIPPING_CARRIERS = [
  "Blue Dart",
  "DTDC",
  "Delhivery",
  "FedEx",
  "DHL",
  "India Post",
  "Ekart",
  "Other",
];

export function getTrackingUrl(carrier: string | null | undefined, trackingNumber: string | null | undefined): string | null {
  if (!carrier || !trackingNumber?.trim()) return null;
  const normalized = trackingNumber.trim();
  for (const { match, url } of CARRIER_TRACKING) {
    if (match.test(carrier)) return url(normalized);
  }
  return null;
}

export const ORDER_STATUS_STEPS = [
  { key: "PENDING", label: "Order Received" },
  { key: "CONFIRMED", label: "Payment Confirmed" },
  { key: "PROCESSING", label: "Preparing Shipment" },
  { key: "SHIPPED", label: "In Transit" },
  { key: "DELIVERED", label: "Delivered" },
] as const;

export function getOrderStepIndex(status: string): number {
  const idx = ORDER_STATUS_STEPS.findIndex((s) => s.key === status);
  if (idx >= 0) return idx;
  if (status === "CANCELLED") return -1;
  return 0;
}
