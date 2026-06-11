import type { Metadata } from "next";
import { Suspense } from "react";
import { staticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = staticPageMetadata("cart");

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
