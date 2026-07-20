import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Site Map",
  description: "Browse all public pages on the Dentium India website.",
  path: "/site-map",
});

const groups = [
  {
    title: "Company",
    links: [
      ["Home", "/"],
      ["About Us", "/about"],
      ["Our Team", "/our-team"],
      ["Global Network", "/global-network"],
      ["Careers", "/careers"],
      ["Contact Us", "/contact"],
    ],
  },
  {
    title: "Products & Shop",
    links: [
      ["Products", "/products"],
      ["Shop", "/shop"],
      ["Shopping Cart", "/shop/cart"],
      ["Request Quote", "/shop/cart?quote=true"],
      ["Order Tracking", "/order-tracking"],
    ],
  },
  {
    title: "Media & Education",
    links: [
      ["Blog / News", "/blog"],
      ["Events", "/events"],
      ["Video Library", "/video-library"],
      ["Dentium Study", "/dentium-study"],
      ["Downloads", "/downloads"],
      ["Gallery", "/gallery"],
    ],
  },
  {
    title: "Account & Support",
    links: [
      ["My Account", "/account"],
      ["Login", "/auth/login"],
      ["Sign Up", "/auth/register"],
      ["Forgot Password", "/auth/forgot-password"],
      ["FAQs", "/faqs"],
      ["Privacy Policy", "/privacy"],
      ["Terms & Conditions", "/terms"],
    ],
  },
] as const;

export default function SiteMapPage() {
  return (
    <>
      <PageHeader
        title="Site Map"
        subtitle="Navigation"
        description="Find every section of the Dentium India website."
      />

      <section className="relative overflow-hidden bg-gradient-to-b from-brand-gray via-white to-white py-16 lg:py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-accent/40 to-transparent" />

        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 xl:gap-14">
            {groups.map((group, index) => (
              <div key={group.title} className="group/col relative">
                <div className="mb-6 flex items-end justify-between gap-3 border-b border-brand-navy/10 pb-4">
                  <div>
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-brand-silver">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h2 className="text-xl font-semibold tracking-tight text-brand-navy lg:text-[1.35rem]">
                      {group.title}
                    </h2>
                  </div>
                  <span className="mb-1 h-1 w-8 rounded-full bg-brand-accent opacity-80 transition-all duration-300 group-hover/col:w-12" />
                </div>

                <ul className="space-y-1">
                  {group.links.map(([label, href]) => (
                    <li key={`${group.title}-${href}`}>
                      <Link
                        href={href}
                        className="group/link flex items-center justify-between gap-3 rounded-sm px-1 py-2.5 text-[15px] text-brand-dark/70 transition-all duration-200 hover:bg-brand-accent/10 hover:pl-2 hover:text-brand-navy"
                      >
                        <span>{label}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-brand-accent opacity-0 transition-all duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
