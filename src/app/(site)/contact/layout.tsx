import type { Metadata } from "next";
import { Suspense } from "react";
import { staticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = staticPageMetadata("contact");

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
