import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = staticPageMetadata("orderTracking");

export default function OrderTrackingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
