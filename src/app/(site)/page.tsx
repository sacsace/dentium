import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { toClientProduct } from "@/lib/product-client";
import { HeroBanner } from "@/components/home/HeroBanner";
import { StatsSection } from "@/components/home/StatsSection";
import { ProductCategories } from "@/components/home/ProductCategories";
import { ParallaxBreak } from "@/components/home/ParallaxBreak";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { NewsSection } from "@/components/home/NewsSection";
import { EventsSection } from "@/components/home/EventsSection";
import { DentalStudySection } from "@/components/home/DentalStudySection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, getSiteSeoSettings, STATIC_SEO } from "@/lib/seo";
import { websiteSchema } from "@/lib/seo-schemas";
import { getHeroSlides } from "@/lib/hero-slides";
import { getServerPriceContext } from "@/lib/session-price";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSeoSettings();
  return buildMetadata({
    absoluteTitle: settings?.seoTitle || undefined,
    description: settings?.seoDescription || STATIC_SEO.home.description,
    keywords: settings?.seoKeywords,
    path: "/",
  });
}

async function getHomeData() {
  try {
    const [categories, products, posts, events, studyPosts] = await Promise.all([
      prisma.category.findMany({ where: { isActive: true, parentId: null }, orderBy: { sortOrder: "asc" }, take: 6 }),
      prisma.product.findMany({ where: { isActive: true, isFeatured: true }, orderBy: { sortOrder: "asc" }, take: 4 }),
      prisma.post.findMany({
        where: { status: "PUBLISHED", NOT: { tags: { has: "dentium-study" } } },
        orderBy: { publishedAt: "desc" },
        take: 5,
      }),
      prisma.event.findMany({ where: { status: "UPCOMING" }, orderBy: { startDate: "asc" }, take: 3 }),
      prisma.post.findMany({
        where: { status: "PUBLISHED", tags: { has: "dentium-study" } },
        orderBy: { publishedAt: "desc" },
        take: 8,
      }),
    ]);

    return { categories, products, posts, events, studyPosts };
  } catch {
    return {
      categories: [],
      products: [],
      posts: [],
      events: [],
      studyPosts: [],
    };
  }
}

export default async function HomePage() {
  const { priceAccess } = await getServerPriceContext();
  const [data, heroSlides] = await Promise.all([getHomeData(), getHeroSlides()]);

  return (
    <>
      <JsonLd data={websiteSchema()} />
      <HeroBanner slides={heroSlides} />
      <StatsSection />
      {data.categories.length > 0 && <ProductCategories categories={data.categories} />}
      <ParallaxBreak />
      {data.products.length > 0 && (
        <FeaturedProducts products={data.products.map(toClientProduct)} priceAccess={priceAccess} />
      )}
      {data.events.length > 0 && <EventsSection events={data.events} />}
      {data.studyPosts.length > 0 ? (
        <DentalStudySection items={data.studyPosts} />
      ) : (
        <DentalStudySection
          items={[
            { id: "1", title: "Step-by-Step Dentium Bright Implants Prosthetic Workflow", slug: "bright-workflow" },
            { id: "2", title: "Dentium SuperLine Surgical Kit - Overview", slug: "superline-kit" },
            { id: "3", title: "Dentium Guided Surgery Kit – Your Digital Implant Solution", slug: "guided-surgery" },
            { id: "4", title: "Simple Implantation with bright Tissue Level", slug: "bright-tl" },
          ]}
        />
      )}
      {data.posts.length > 0 && <NewsSection posts={data.posts} />}
      <NewsletterSection />
    </>
  );
}
