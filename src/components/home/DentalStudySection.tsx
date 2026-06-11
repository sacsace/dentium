"use client";

import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

interface StudyItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
}

export function DentalStudySection({ items }: { items: StudyItem[] }) {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-brand-deep text-sm tracking-[0.2em] uppercase mb-3">Education</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-brand-navy">Dental Study</h2>
          </div>
          <Link href="/dentium-study" className="inline-flex items-center gap-2 text-brand-deep font-medium hover:gap-3 transition-all">
            View more <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.slice(0, 8).map((item, i) => (
            <AnimatedSection key={item.id} delay={i * 0.05}>
              <Link
                href={`/dentium-study#${item.slug}`}
                className="group flex items-start gap-3 p-4 bg-brand-gray rounded-sm hover:bg-brand-light transition-colors h-full"
              >
                <div className="shrink-0 w-10 h-10 bg-brand-deep rounded-sm flex items-center justify-center text-white group-hover:bg-brand-blue transition-colors">
                  <Play className="w-4 h-4 ml-0.5" />
                </div>
                <p className="text-sm font-medium text-brand-navy group-hover:text-brand-deep line-clamp-3">{item.title}</p>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
