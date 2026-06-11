import { staticPageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { prisma } from "@/lib/prisma";
import { MapPin, Phone, Mail, Globe, Clock } from "lucide-react";
import { INDIA_OFFICES } from "@/lib/site-config";

export const metadata = staticPageMetadata("globalNetwork");

function officeTitle(city: string, isHeadquarter: boolean) {
  return isHeadquarter ? `${city} - Head Office` : city;
}

export default async function GlobalNetworkPage() {
  let offices: Awaited<ReturnType<typeof prisma.globalOffice.findMany>> = [];

  try {
    offices = await prisma.globalOffice.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    // DB not connected
  }

  const displayOffices =
    offices.length > 0
      ? offices.map((o) => ({
          id: o.id,
          title: officeTitle(o.city, o.isHeadquarter),
          city: o.city,
          country: o.country,
          address: o.address,
          phone: o.phone,
          email: o.email,
          isHeadquarter: o.isHeadquarter,
        }))
      : INDIA_OFFICES.map((o) => ({
          id: o.id,
          title: o.title,
          city: o.city,
          country: o.country,
          address: o.address,
          phone: o.phone,
          email: o.email,
          isHeadquarter: o.isHeadquarter,
        }));

  const countries = new Set(displayOffices.map((o) => o.country));

  return (
    <>
      <PageHeader
        title="Global Network"
        subtitle="Worldwide Presence"
        description={`Serving ${Math.max(countries.size, 80)}+ countries worldwide`}
      />

      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <Globe className="w-16 h-16 text-brand-deep mx-auto mb-4" />
            <p className="text-brand-silver max-w-2xl mx-auto">
              As part of the global Dentium family, we connect dental professionals worldwide with innovative solutions and comprehensive support.
            </p>
          </AnimatedSection>

          <AnimatedSection className="mb-10">
            <h2 className="font-display text-2xl font-semibold text-brand-navy mb-2">Our Locations — India</h2>
            <p className="text-brand-silver text-sm">Implantium India Private Limited offices across India.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayOffices.map((office, i) => (
              <AnimatedSection key={office.id} delay={i * 0.05}>
                <div className={`p-6 rounded-sm h-full ${office.isHeadquarter ? "bg-brand-navy text-white" : "bg-brand-gray"}`}>
                  {office.isHeadquarter && (
                    <span className="text-[10px] uppercase tracking-wider text-brand-light mb-2 block">Head Office</span>
                  )}
                  <h3 className={`font-semibold text-lg mb-1 ${office.isHeadquarter ? "text-white" : "text-brand-navy"}`}>
                    {office.title}
                  </h3>
                  <p className={`text-sm mb-4 ${office.isHeadquarter ? "text-white/60" : "text-brand-silver"}`}>
                    {office.country}
                  </p>
                  <div className={`space-y-2 text-sm ${office.isHeadquarter ? "text-white/70" : "text-brand-silver"}`}>
                    {office.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{office.address}</span>
                      </div>
                    )}
                    {office.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 shrink-0" />
                        <span>{office.phone}</span>
                      </div>
                    )}
                    {office.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 shrink-0" />
                        <span>{office.email}</span>
                      </div>
                    )}
                    {INDIA_OFFICES.find((o) => o.city === office.city)?.hours && (
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{INDIA_OFFICES.find((o) => o.city === office.city)?.hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
