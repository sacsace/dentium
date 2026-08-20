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
    <section className="py-20 md:py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <p className="section-eyebrow">Education</p>
            <h2 className="section-title">Dental Study</h2>
          </div>
          <Link
            href="/dentium-study"
            className="inline-flex items-center gap-2 text-brand-navy font-semibold text-sm border-b border-brand-navy/20 pb-0.5 hover:border-brand-accent hover:text-brand-deep transition-colors"
          >
            View more <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {items.slice(0, 8).map((item, i) => (
            <AnimatedSection key={item.id} delay={i * 0.04}>
              <Link
                href={`/dentium-study#${item.slug}`}
                className="group flex items-start gap-3 p-4 border border-brand-muted bg-brand-gray hover:bg-white hover:border-brand-navy/20 transition-colors h-full"
              >
                <div className="shrink-0 w-9 h-9 bg-brand-navy flex items-center justify-center text-white group-hover:bg-brand-accent group-hover:text-brand-navy transition-colors">
                  <Play className="w-3.5 h-3.5 ml-0.5" />
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
