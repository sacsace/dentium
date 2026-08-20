"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
}

export function ProductCategories({ categories }: { categories: Category[] }) {
  return (
    <section className="py-20 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-64px" }}
          transition={{ duration: 0.45 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <p className="section-eyebrow">Dentium Solution</p>
            <h2 className="section-title">Product Categories</h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-brand-navy font-semibold text-sm border-b border-brand-navy/20 pb-0.5 hover:border-brand-accent hover:text-brand-deep transition-colors group"
          >
            View all <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link href={`/products?category=${cat.slug}`} className="group block">
                <div className="relative overflow-hidden aspect-[4/3] bg-brand-gray border border-brand-muted">
                  {cat.image && (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-navy/35 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="w-8 h-0.5 bg-brand-accent mb-3" />
                    <h3 className="text-white text-xl md:text-2xl font-semibold mb-1 tracking-tight">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-white/60 text-sm line-clamp-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {cat.description}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-2 text-brand-accent text-sm font-medium">
                      Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
