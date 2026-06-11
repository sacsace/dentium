"use client";

import Link from "next/link";
import { ArrowRight, Mail, Users, Handshake } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

const ctaItems = [
  {
    icon: Mail,
    title: "Reach out to us",
    description: "Learn more about our products, specifications, and pricing options.",
    href: "/contact",
    label: "Contact Us",
  },
  {
    icon: Users,
    title: "Join our team",
    description: "Discover opportunities to grow with us and join our team.",
    href: "/contact?type=careers",
    label: "Careers",
  },
  {
    icon: Handshake,
    title: "Find our partners",
    description: "Get in touch with our dealer network or inquire about partnerships.",
    href: "/contact?type=partnership",
    label: "Partnership",
  },
];

export function CTASection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <p className="text-brand-deep text-sm tracking-[0.2em] uppercase mb-3">Dentium Information</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-brand-navy">
            Need more details? We&apos;re here to support you
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ctaItems.map((item, i) => (
            <AnimatedSection key={item.title} delay={i * 0.1}>
              <Link
                href={item.href}
                className="group block p-8 bg-brand-gray rounded-sm hover:bg-brand-light transition-colors duration-500 h-full"
              >
                <item.icon className="w-8 h-8 text-brand-deep mb-4" />
                <h3 className="font-semibold text-brand-navy text-lg mb-2">{item.title}</h3>
                <p className="text-brand-silver text-sm mb-4">{item.description}</p>
                <span className="inline-flex items-center gap-2 text-brand-deep text-sm font-medium group-hover:gap-3 transition-all">
                  {item.label} <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
