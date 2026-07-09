import { prisma } from "@/lib/prisma";
import { HERO_SLIDES, type HeroSlideConfig } from "@/lib/site-config";

type BannerRecord = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string;
  videoUrl: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  isActive: boolean;
  sortOrder: number;
};

export function bannerToHeroSlide(banner: BannerRecord): HeroSlideConfig | null {
  if (!banner.isActive) return null;

  if (banner.videoUrl?.trim()) {
    return {
      id: banner.id,
      kind: "video",
      src: banner.videoUrl.trim(),
      poster: banner.image || undefined,
    };
  }

  if (!banner.image?.trim()) return null;

  return {
    id: banner.id,
    kind: "image",
    image: banner.image,
    title: banner.title,
    subtitle: banner.subtitle || undefined,
    description: banner.description || undefined,
    ctaText: banner.ctaText || undefined,
    ctaLink: banner.ctaLink || undefined,
  };
}

export async function getHeroSlides(): Promise<HeroSlideConfig[]> {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        image: true,
        videoUrl: true,
        ctaText: true,
        ctaLink: true,
        isActive: true,
        sortOrder: true,
      },
    });

    const slides = banners
      .map(bannerToHeroSlide)
      .filter((slide): slide is HeroSlideConfig => slide !== null);

    if (slides.length > 0) return slides;
  } catch {
    // DB unavailable — fall back to static slides
  }

  return HERO_SLIDES;
}
