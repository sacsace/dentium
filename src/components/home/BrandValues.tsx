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
            <AnimatedSection key={value.title} delay={i * 0.15} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-light rounded-full mb-4">
                <value.icon className="w-6 h-6 text-brand-deep" />
              </div>
              <h3 className="font-display text-xl font-semibold text-brand-navy mb-2">
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
