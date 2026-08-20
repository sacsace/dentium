"use client";

import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Shield, Heart, Smile } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Confidence for Clinicians",
    description: "Where uncertainty becomes possibility through proven, predictable solutions.",
  },
  {
    icon: Heart,
    title: "Comfort for Patients",
    description: "Designed with patient well-being at the core of every innovation.",
  },
  {
    icon: Smile,
    title: "Support Your Journey",
    description: "Toward a confident, comfortable smile with comprehensive clinical support.",
  },
];

export function BrandValues() {
  return (
    <section className="py-20 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, i) => (
            <AnimatedSection key={value.title} delay={i * 0.08} className="text-left md:text-center border border-brand-muted bg-brand-gray p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-navy text-brand-accent mb-4">
                <value.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-brand-navy mb-2 tracking-tight">
                {value.title}
              </h3>
              <p className="text-brand-silver text-sm leading-relaxed max-w-xs mx-auto">
                {value.description}
              </p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
