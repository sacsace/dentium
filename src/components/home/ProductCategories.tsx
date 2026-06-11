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
    <section className="py-28 bg-white overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <p className="text-brand-accent-dark text-sm tracking-[0.25em] uppercase mb-3 font-medium">Dentium Solution</p>
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-brand-navy">Product Categories</h2>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 text-brand-deep font-medium hover:gap-3 transition-all group">
            View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link href={`/products?category=${cat.slug}`} className="group block">
                <div className="relative overflow-hidden aspect-[4/3] bg-brand-gray">
                  {cat.image && (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand-accent/40 transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-7 transform transition-transform duration-500 group-hover:-translate-y-1">
                    <div className="w-8 h-0.5 bg-brand-accent mb-4 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    <h3 className="text-white text-2xl font-semibold mb-2">{cat.name}</h3>
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
