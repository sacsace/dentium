"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LogIn, ShieldCheck } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { getProductPriceLabel, type ClientProduct } from "@/lib/product-client";
import type { PriceAccess } from "@/lib/membership";

export function FeaturedProducts({
  products,
  priceAccess = "guest",
}: {
  products: ClientProduct[];
  priceAccess?: PriceAccess;
}) {
  return (
    <section className="py-20 md:py-24 bg-brand-gray">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="section-eyebrow">Products</p>
            <h2 className="section-title">Featured Products</h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-brand-navy font-semibold text-sm border-b border-brand-navy/20 pb-0.5 hover:border-brand-accent hover:text-brand-deep transition-colors"
          >
            View more <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product, i) => (
            <AnimatedSection key={product.id} delay={i * 0.06}>
              <Link
                href={`/products/${product.slug}`}
                className="group block surface-panel overflow-hidden hover:border-brand-navy/25 transition-colors"
              >
                <div className="relative aspect-square bg-brand-light overflow-hidden">
                  {product.images[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                  {product.isNew && (
                    <span className="absolute top-3 left-3 bg-brand-navy text-white text-[11px] font-semibold tracking-wide px-2 py-1">
                      NEW
                    </span>
                  )}
                </div>
                <div className="p-4 md:p-5">
                  <h3 className="font-semibold text-brand-navy mb-1 group-hover:text-brand-deep transition-colors">
                    {product.name}
                  </h3>
                  {product.shortDesc && (
                    <p className="text-brand-silver text-sm mb-3 line-clamp-2">{product.shortDesc}</p>
                  )}
                  {priceAccess === "full" ? (
                    <p className="text-brand-deep font-medium text-sm">{getProductPriceLabel(product, priceAccess)}</p>
                  ) : priceAccess === "associate" ? (
                    <span className="inline-flex items-center gap-1.5 text-brand-deep font-medium text-sm">
                      <ShieldCheck className="w-3.5 h-3.5" /> Full membership required
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-brand-deep font-medium text-sm">
                      <LogIn className="w-3.5 h-3.5" /> Login for Price
                    </span>
                  )}
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
