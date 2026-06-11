import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = staticPageMetadata("register");

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
