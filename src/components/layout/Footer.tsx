"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { SITE } from "@/lib/site-config";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { DentiumLogo } from "@/components/brand/DentiumLogo";
import { useLanguage } from "@/i18n/LanguageProvider";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Career", href: "/careers" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Site Map", href: "/site-map" },
  ],
  products: [
    { label: "Implant System", href: "/products?category=implant-system" },
    { label: "Bright", href: "/products?category=bright" },
    { label: "SuperLine", href: "/products?category=superline" },
  ],
  events: [
    { label: "Event Calendar", href: "/events" },
    { label: "Video Library", href: "/video-library" },
    { label: "Dentium Study", href: "/dentium-study" },
  ],
  account: [
    { label: "My Order", href: "/account" },
    { label: "Shopping Cart", href: "/shop/cart" },
    { label: "My Profile", href: "/account" },
    { label: "Order Tracking", href: "/order-tracking" },
  ],
  support: [
    { label: "FAQs", href: "/faqs" },
    { label: "Downloads", href: "/downloads" },
    { label: "Gallery", href: "/gallery" },
  ],
};

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-brand-navy text-white">
      <NewsletterSection variant="footer" />

      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <DentiumLogo href="/" size="md" variant="onGreen" />
            </div>
            <p className="text-white/50 text-xs mb-3">{SITE.legalName}</p>
            <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-sm">{t(SITE.about)}</p>
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{SITE.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 shrink-0" />
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-white">{SITE.phone}</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 shrink-0" />
                <a href={`mailto:${SITE.email}`} className="hover:text-white">{SITE.email}</a>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([key, links]) => (
            <div key={key}>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/90 capitalize">
                {t(key)}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                      {t(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10">
          {SITE.trustBadges.map((badge) => (
            <div key={badge.title} className="text-center md:text-left">
              <p className="font-medium text-sm text-white/90">{t(badge.title)}</p>
              <p className="text-white/50 text-xs mt-1">{t(badge.desc)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} {SITE.legalName}. {t(`${SITE.brand} is a registered trademark. All Rights Reserved.`)}
          </p>
        </div>
      </div>
    </footer>
  );
}
