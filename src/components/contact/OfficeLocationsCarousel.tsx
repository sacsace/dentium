"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Phone, Mail, Clock } from "lucide-react";
import type { IndiaOffice } from "@/lib/site-config";

type OfficeLocationsCarouselProps = {
  offices: readonly IndiaOffice[];
  title?: string;
};

export function OfficeLocationsCarousel({ offices, title = "Our Locations" }: OfficeLocationsCarouselProps) {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const maxPage = Math.max(0, Math.ceil(offices.length / perPage) - 1);

  const visible =
    offices.length <= perPage
      ? offices
      : offices.slice(page * perPage, page * perPage + perPage);

  const canPrev = offices.length > perPage && page > 0;
  const canNext = offices.length > perPage && page < maxPage;

  return (
    <section className="py-16 bg-brand-gray">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-brand-navy">{title}</h2>
          {offices.length > perPage && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={!canPrev}
                className="w-10 h-10 rounded-full border border-brand-silver/40 bg-white flex items-center justify-center text-brand-navy hover:border-brand-accent hover:text-brand-accent-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous locations"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                disabled={!canNext}
                className="w-10 h-10 rounded-full border border-brand-silver/40 bg-white flex items-center justify-center text-brand-navy hover:border-brand-accent hover:text-brand-accent-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next locations"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((office) => (
            <article
              key={office.id}
              className="bg-white rounded-sm shadow-sm border border-brand-gray p-6 lg:p-7 h-full flex flex-col"
            >
              <h3 className="font-semibold text-brand-navy text-lg mb-4 pb-4 border-b border-brand-gray">
                {office.title}
              </h3>

              <div className="flex gap-3 mb-5">
                <div className="w-9 h-9 rounded-full bg-brand-accent/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-brand-accent-dark" />
                </div>
                <p className="text-brand-silver text-sm leading-relaxed">{office.address}</p>
              </div>

              <div className="space-y-4 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-accent/20 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-brand-accent-dark" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-silver">Call Us</p>
                    <a href={`tel:${office.phone.replace(/\s/g, "")}`} className="text-sm text-brand-navy hover:text-brand-deep">
                      {office.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-accent/20 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-brand-accent-dark" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-silver">Email Us</p>
                    <a href={`mailto:${office.email}`} className="text-sm text-brand-navy hover:text-brand-deep break-all">
                      {office.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-accent/20 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-brand-accent-dark" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-silver">Operating Hours</p>
                    <p className="text-sm text-brand-navy">{office.hours}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
