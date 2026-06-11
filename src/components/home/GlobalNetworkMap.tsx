"use client";

import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Globe } from "lucide-react";

interface Office {
  id: string;
  country: string;
  city: string;
  isHeadquarter: boolean;
}

export function GlobalNetworkMap({ offices, countryCount }: { offices: Office[]; countryCount: number }) {
  return (
    <section className="py-24 bg-brand-gray">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <p className="text-brand-deep text-sm tracking-[0.2em] uppercase mb-3">Global Networks</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-brand-navy mb-4">
            Serving {countryCount}+ Countries Worldwide
          </h2>
          <p className="text-brand-silver max-w-2xl mx-auto">
            Part of the global Dentium network, bringing world-class dental solutions to clinicians everywhere
          </p>
        </AnimatedSection>

        <AnimatedSection>
          <div className="relative bg-brand-navy rounded-sm overflow-hidden p-8 md:p-16">
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 1000 500" className="w-full h-full">
                <ellipse cx="500" cy="250" rx="480" ry="230" fill="none" stroke="white" strokeWidth="0.5" />
                <ellipse cx="500" cy="250" rx="350" ry="170" fill="none" stroke="white" strokeWidth="0.5" />
                <ellipse cx="500" cy="250" rx="220" ry="110" fill="none" stroke="white" strokeWidth="0.5" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <Globe className="w-16 h-16 text-brand-light/30 mb-8" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                {offices.slice(0, 8).map((office) => (
                  <div
                    key={office.id}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm p-4 text-center hover:bg-white/10 transition-colors"
                  >
                    <p className="text-white font-medium text-sm">{office.city}</p>
                    <p className="text-white/50 text-xs">{office.country}</p>
                    {office.isHeadquarter && (
                      <span className="inline-block mt-1 text-[10px] text-brand-light uppercase tracking-wider">
                        HQ
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
