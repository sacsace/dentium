import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, eventSchema } from "@/lib/seo-schemas";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event) return buildMetadata({ title: "Event Not Found", path: `/events/${slug}`, noIndex: true });
    return buildMetadata({
      title: event.title,
      description: event.excerpt || event.description.slice(0, 160),
      path: `/events/${slug}`,
      image: event.featuredImage,
      type: "article",
      publishedTime: event.startDate.toISOString(),
      modifiedTime: event.updatedAt.toISOString(),
    });
  } catch {
    return buildMetadata({ title: "Event", path: `/events/${slug}` });
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;

  let event = null;
  try {
    event = await prisma.event.findUnique({ where: { slug } });
  } catch {
    // DB not connected
  }

  if (!event) notFound();

  return (
    <article className="pt-28 pb-20">
      <JsonLd
        data={[
          eventSchema(event),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Events", path: "/events" },
            { name: event.title, path: `/events/${event.slug}` },
          ]),
        ]}
      />
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <Link href="/events" className="inline-flex items-center gap-2 text-brand-deep text-sm mb-8 hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>

        {event.featuredImage && (
          <div className="relative aspect-[16/9] rounded-sm overflow-hidden mb-8">
            <Image src={event.featuredImage} alt={event.title} fill className="object-cover" />
          </div>
        )}

        <span className="text-brand-deep text-xs tracking-wider uppercase">{event.status}</span>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-brand-navy mt-2 mb-6">
          {event.title}
        </h1>

        <div className="flex flex-wrap gap-6 text-brand-silver text-sm mb-8 pb-8 border-b">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-deep" />
            {formatDate(event.startDate)}
            {event.endDate && ` — ${formatDate(event.endDate)}`}
          </span>
          {event.location && (
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-deep" />
              {event.location}
              {event.venue && `, ${event.venue}`}
            </span>
          )}
        </div>

        <div className="prose-content" dangerouslySetInnerHTML={{ __html: event.description.replace(/\n/g, "<br/>") }} />

        {event.registrationUrl && (
          <div className="mt-10">
            <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
              <Button>
                Register Now <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
