"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { formatDate } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  location?: string | null;
  startDate: Date;
}

export function EventsSection({ events }: { events: Event[] }) {
  return (
    <section className="py-24 bg-brand-navy text-white">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <p className="text-brand-light/60 text-sm tracking-[0.2em] uppercase mb-3">Seminars & Events</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold">
              Upcoming Events
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-white/80 font-medium hover:text-white hover:gap-3 transition-all"
          >
            View all events <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <AnimatedSection key={event.id} delay={i * 0.1}>
              <Link href={`/events/${event.slug}`} className="group block">
                <div className="relative aspect-[16/10] rounded-sm overflow-hidden mb-4">
                  {event.featuredImage && (
                    <Image
                      src={event.featuredImage}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-brand-navy/20 group-hover:bg-brand-navy/10 transition-colors" />
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-brand-light transition-colors">
                  {event.title}
                </h3>
                {event.excerpt && (
                  <p className="text-white/60 text-sm mb-3 line-clamp-2">{event.excerpt}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-white/50">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(event.startDate)}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {event.location}
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
