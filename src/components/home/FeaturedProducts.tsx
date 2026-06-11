"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, LogIn } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { getProductPriceLabel, type ClientProduct } from "@/lib/product-client";

export function FeaturedProducts({ products, isLoggedIn = false }: { products: ClientProduct[]; isLoggedIn?: boolean }) {
  return (
    <section className="py-24 bg-brand-gray">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <p className="text-brand-deep text-sm tracking-[0.2em] uppercase mb-3">Products</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-brand-navy">Featured Products</h2>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 text-brand-deep font-medium hover:gap-3 transition-all">
            View more <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <AnimatedSection key={product.id} delay={i * 0.1}>
              <Link href={`/products/${product.slug}`} className="group block bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
                <div className="relative aspect-square bg-brand-light overflow-hidden">
                  {product.images[0] && (
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  )}
                  {product.isNew && (
                    <span className="absolute top-3 left-3 bg-brand-deep text-white text-xs px-2 py-1 rounded-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> New
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-brand-navy mb-1 group-hover:text-brand-deep transition-colors">{product.name}</h3>
                  {product.shortDesc && (
                    <p className="text-brand-silver text-sm mb-3 line-clamp-2">{product.shortDesc}</p>
                  )}
                  {!isLoggedIn ? (
                    <span className="inline-flex items-center gap-1.5 text-brand-deep font-medium text-sm">
                      <LogIn className="w-3.5 h-3.5" /> Login for Price
                    </span>
                  ) : (
                    <p className="text-brand-deep font-medium text-sm">
                      {getProductPriceLabel(product, isLoggedIn)}
                    </p>
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
