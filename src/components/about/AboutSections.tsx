import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Globe, History, Target, Users } from "lucide-react";

const LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#mission", label: "Mission & Vision" },
  { href: "#our-journey", label: "Our Journey" },
  { href: "/our-team", label: "Our Team" },
  { href: "/global-network", label: "Global Network" },
] as const;

export function AboutQuickNav() {
  return (
    <nav
      aria-label="About page sections"
      className="sticky top-[72px] z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <ul className="flex gap-1 overflow-x-auto py-3 scrollbar-none">
          {LINKS.map((link) => (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                className="inline-block px-4 py-2 text-sm font-medium text-brand-silver hover:text-brand-navy hover:bg-brand-gray/60 rounded-sm transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

const STATS = [
  { value: "2000", label: "Founded" },
  { value: "80+", label: "Countries served" },
  { value: "2003", label: "CE certified" },
  { value: "2004", label: "FDA approved" },
] as const;

export function AboutStatsBar() {
  return (
    <section className="bg-brand-navy text-white border-b border-white/10">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          {STATS.map((stat) => (
            <div key={stat.label} className="py-6 lg:py-8 px-4 lg:px-8 text-center lg:text-left">
              <p className="font-display text-2xl md:text-3xl font-semibold text-brand-accent">{stat.value}</p>
              <p className="text-white/60 text-xs md:text-sm mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface AboutExploreCardProps {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}

function AboutExploreCard({ href, icon, title, description }: AboutExploreCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col p-6 lg:p-8 bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-accent/40 transition-all duration-300 h-full"
    >
      <div className="w-11 h-11 rounded-sm bg-brand-accent/15 text-brand-deep flex items-center justify-center mb-4 group-hover:bg-brand-accent/25 transition-colors">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold text-brand-navy mb-2 group-hover:text-brand-deep transition-colors">
        {title}
      </h3>
      <p className="text-brand-silver text-sm leading-relaxed flex-1">{description}</p>
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-deep mt-4 group-hover:gap-2.5 transition-all">
        Learn more
        <ArrowRight className="w-4 h-4" />
      </span>
    </Link>
  );
}

export function AboutExploreSection() {
  return (
    <section className="py-16 lg:py-20 bg-brand-gray/40">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="text-brand-deep text-sm font-medium uppercase tracking-wider mb-2">Explore</p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-brand-navy mb-10">
          Discover more about Dentium
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AboutExploreCard
            href="/our-team"
            icon={<Users className="w-5 h-5" />}
            title="Our Team"
            description="Meet the professionals supporting clinicians across India."
          />
          <AboutExploreCard
            href="/global-network"
            icon={<Globe className="w-5 h-5" />}
            title="Global Network"
            description="Dentium serves dental professionals in 80+ countries worldwide."
          />
          <AboutExploreCard
            href="/contact"
            icon={<Target className="w-5 h-5" />}
            title="Contact Us"
            description="Reach our India offices for product support and partnerships."
          />
        </div>
      </div>
    </section>
  );
}

export function AboutSectionHeading({
  eyebrow,
  title,
  icon,
}: {
  eyebrow: string;
  title: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 mb-10 lg:mb-12">
      {icon && (
        <div className="shrink-0 w-12 h-12 rounded-sm bg-brand-accent/15 text-brand-deep flex items-center justify-center">
          {icon}
        </div>
      )}
      <div>
        <p className="text-brand-deep text-sm font-medium uppercase tracking-wider mb-1">{eyebrow}</p>
        <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-brand-navy">{title}</h2>
      </div>
    </div>
  );
}

export function AboutHistoryIcon() {
  return <History className="w-6 h-6" />;
}
