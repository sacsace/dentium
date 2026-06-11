import { staticPageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Target, Eye, Globe, ArrowRight } from "lucide-react";
import { SITE, ABOUT_PAGE } from "@/lib/site-config";
import { Button } from "@/components/ui/Button";

export const metadata = staticPageMetadata("about");

async function getAboutData() {
  try {
    return await prisma.siteSettings.findFirst();
  } catch {
    return null;
  }
}

function splitParagraphs(text: string): string[] {
  return text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
}

export default async function AboutPage() {
  const settings = await getAboutData();

  const overviewParagraphs = settings?.aboutContent
    ? splitParagraphs(settings.aboutContent)
    : [...ABOUT_PAGE.overview];

  const missionParagraphs = splitParagraphs(settings?.aboutMission || ABOUT_PAGE.mission);
  const visionText = settings?.aboutVision || ABOUT_PAGE.vision;

  return (
    <>
      <PageHeader
        title={settings?.aboutTitle || ABOUT_PAGE.title}
        subtitle="Company"
        description={ABOUT_PAGE.headerDescription}
      />

      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <AnimatedSection>
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden sticky top-28">
                <Image
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800"
                  alt={`${SITE.brand} — ${SITE.legalName}`}
                  fill
                  className="object-cover"
                />
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <h2 className="font-display text-3xl font-semibold text-brand-navy mb-6">
                {ABOUT_PAGE.overviewTitle}
              </h2>
              <div className="prose-content text-brand-dark/80 space-y-4">
                {overviewParagraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand-gray">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnimatedSection>
              <div className="bg-white p-8 lg:p-10 rounded-sm h-full">
                <Target className="w-8 h-8 text-brand-deep mb-4" />
                <h3 className="font-display text-2xl font-semibold text-brand-navy mb-4">Our Mission</h3>
                <div className="space-y-4">
                  {missionParagraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)} className="text-brand-silver text-sm leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <div className="bg-white p-8 lg:p-10 rounded-sm h-full">
                <Eye className="w-8 h-8 text-brand-deep mb-4" />
                <h3 className="font-display text-2xl font-semibold text-brand-navy mb-4">Our Vision</h3>
                <p className="text-brand-silver text-sm leading-relaxed">{visionText}</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-brand-gray">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-brand-navy">
              <Globe className="w-6 h-6 text-brand-deep shrink-0" />
              <div>
                <p className="font-semibold">Global Network</p>
                <p className="text-brand-silver text-sm">Dentium serves clinicians in 80+ countries worldwide.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/global-network">
                <Button size="md">
                  Global Network
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="md">
                  Contact Us
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
