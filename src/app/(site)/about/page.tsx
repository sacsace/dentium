import { staticPageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Eye, Target } from "lucide-react";
import { SITE, ABOUT_PAGE, type CompanyHistoryEntry } from "@/lib/site-config";
import { CompanyHistoryTimeline } from "@/components/about/CompanyHistoryTimeline";
import {
  AboutExploreSection,
  AboutHistoryIcon,
  AboutQuickNav,
  AboutSectionHeading,
  AboutStatsBar,
} from "@/components/about/AboutSections";

export const metadata = staticPageMetadata("about");

async function getAboutData() {
  try {
    return await prisma.siteSettings.findFirst();
  } catch {
    return null;
  }
}

async function getCompanyHistory(): Promise<CompanyHistoryEntry[]> {
  try {
    const items = await prisma.companyHistory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { year: "asc" }],
      select: { year: true, title: true, description: true },
    });
    if (items.length > 0) return items;
  } catch {
    /* table may not exist before migration */
  }
  return [...ABOUT_PAGE.history];
}

function splitParagraphs(text: string): string[] {
  return text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
}

export default async function AboutPage() {
  const [settings, historyItems] = await Promise.all([getAboutData(), getCompanyHistory()]);

  const overviewParagraphs = settings?.aboutContent
    ? splitParagraphs(settings.aboutContent)
    : [...ABOUT_PAGE.overview];

  const [leadParagraph, ...restOverview] = overviewParagraphs;
  const missionParagraphs = splitParagraphs(settings?.aboutMission || ABOUT_PAGE.mission);
  const visionText = settings?.aboutVision || ABOUT_PAGE.vision;

  return (
    <>
      <PageHeader
        title={settings?.aboutTitle || ABOUT_PAGE.title}
        subtitle="Why Dentium"
        description={ABOUT_PAGE.headerDescription}
      />

      <AboutStatsBar />
      <AboutQuickNav />

      {/* Overview */}
      <section id="overview" className="py-16 lg:py-24 scroll-mt-32">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <AboutSectionHeading eyebrow="Who We Are" title={ABOUT_PAGE.overviewTitle} />
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <AnimatedSection className="lg:col-span-5">
              <div className="relative">
                <div className="absolute -inset-3 bg-brand-accent/20 rounded-sm -z-10 translate-x-3 translate-y-3" />
                <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] rounded-sm overflow-hidden shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800"
                    alt={`${SITE.brand} — ${SITE.legalName}`}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-brand-navy text-white px-5 py-4 rounded-sm shadow-lg max-w-[200px] hidden sm:block">
                  <p className="text-brand-accent text-xs uppercase tracking-wider mb-1">India</p>
                  <p className="text-sm font-medium leading-snug">{SITE.legalName}</p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.15} className="lg:col-span-7">
              {leadParagraph && (
                <p className="text-lg md:text-xl text-brand-navy font-medium leading-relaxed mb-8 border-l-4 border-brand-accent pl-5">
                  {leadParagraph}
                </p>
              )}
              <div className="space-y-5 text-brand-dark/75 text-sm md:text-base leading-relaxed">
                {restOverview.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="mission" className="py-16 lg:py-24 bg-brand-navy text-white scroll-mt-32">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <p className="text-brand-accent text-sm font-medium uppercase tracking-wider mb-2">Purpose</p>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold mb-12 lg:mb-16">
              Mission & Vision
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <AnimatedSection>
              <article className="h-full p-8 lg:p-10 rounded-sm bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-sm bg-brand-accent/20 text-brand-accent flex items-center justify-center mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl lg:text-2xl font-semibold mb-5">Our Mission</h3>
                <div className="space-y-4 text-white/70 text-sm leading-relaxed">
                  {missionParagraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                  ))}
                </div>
              </article>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <article className="h-full p-8 lg:p-10 rounded-sm bg-brand-accent text-brand-navy">
                <div className="w-12 h-12 rounded-sm bg-brand-navy/10 text-brand-navy flex items-center justify-center mb-6">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl lg:text-2xl font-semibold mb-5">Our Vision</h3>
                <p className="text-brand-navy/80 text-sm leading-relaxed">{visionText}</p>
              </article>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Company History */}
      <section id="our-journey" className="py-16 lg:py-24 bg-brand-gray/50 scroll-mt-32">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <AboutSectionHeading
              eyebrow="Our Journey"
              title="Company History"
              icon={<AboutHistoryIcon />}
            />
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <CompanyHistoryTimeline items={historyItems} />
          </AnimatedSection>
        </div>
      </section>

      <AboutExploreSection />
    </>
  );
}
