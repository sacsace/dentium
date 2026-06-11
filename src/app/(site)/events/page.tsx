import { staticPageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { EVENT_REGIONS } from "@/lib/site-config";

export const metadata = staticPageMetadata("events");

interface Props {
  searchParams: Promise<{ region?: string }>;
}

export default async function EventsPage({ searchParams }: Props) {
  const params = await searchParams;
  const where: Record<string, unknown> = {};
  if (params.region) where.region = params.region;

  let events: Awaited<ReturnType<typeof prisma.event.findMany>> = [];

  try {
    events = await prisma.event.findMany({ where, orderBy: { startDate: "desc" } });
  } catch {
    // DB not connected
  }

  return (
    <>
      <PageHeader
        title="Upcoming Seminars"
        subtitle="Events"
        description="Dentium clinical education and seminars across India"
      />

      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap gap-2 mb-10">
            <Link
              href="/events"
              className={`px-4 py-2 text-sm rounded-sm transition-colors ${
                !params.region ? "bg-brand-accent text-brand-navy" : "bg-brand-gray text-brand-dark hover:bg-brand-light"
              }`}
            >
              All
            </Link>
            {EVENT_REGIONS.map((r) => (
              <Link
                key={r.slug}
                href={`/events?region=${r.slug}`}
                className={`px-4 py-2 text-sm rounded-sm transition-colors capitalize ${
                  params.region === r.slug ? "bg-brand-accent text-brand-navy" : "bg-brand-gray text-brand-dark hover:bg-brand-light"
                }`}
              >
                {r.label}
              </Link>
            ))}
          </div>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event, i) => (
                <AnimatedSection key={event.id} delay={i * 0.05}>
                  <Link href={`/events/${event.slug}`} className="group block bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {event.featuredImage && (
                        <Image src={event.featuredImage} alt={event.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      )}
                      <span className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-sm capitalize ${
                        event.status === "UPCOMING" ? "bg-brand-deep text-white" : "bg-brand-silver text-white"
                      }`}>
                        {event.status?.toLowerCase()}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-brand-navy text-lg mb-2 group-hover:text-brand-deep transition-colors">{event.title}</h3>
                      {event.excerpt && <p className="text-brand-silver text-sm mb-4 line-clamp-2">{event.excerpt}</p>}
                      <div className="flex flex-wrap gap-4 text-sm text-brand-silver">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(event.startDate)}</span>
                        {event.venue && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{event.venue}</span>}
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-brand-silver">No events scheduled for this region.</div>
          )}
        </div>
      </section>
    </>
  );
}
