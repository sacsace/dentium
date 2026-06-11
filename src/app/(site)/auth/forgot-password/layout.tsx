import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = staticPageMetadata("forgotPassword");

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
