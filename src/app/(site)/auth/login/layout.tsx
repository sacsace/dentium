import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = staticPageMetadata("login");

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
