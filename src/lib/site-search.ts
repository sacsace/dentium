import { prisma } from "@/lib/prisma";
import { STATIC_SEO } from "@/lib/seo";
import { DENTIUM_STUDY_VIDEOS, SITE_VIDEOS } from "@/lib/site-config";
import { POST_STATUS_ACTIVE } from "@/lib/post-status";

export type SearchResultType = "product" | "blog" | "news" | "event" | "video" | "page" | "download";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  excerpt?: string | null;
  href: string;
  image?: string | null;
  date?: string | null;
  category?: string | null;
  score: number;
};

export const DEFAULT_SEARCH_SUGGESTIONS = [
  "Bright Implant",
  "SuperLine",
  "Surgical Kit",
  "Abutment",
  "CBCT",
  "Bone graft",
  "Implant seminar",
];

const PUBLIC_PAGE_KEYS: (keyof typeof STATIC_SEO)[] = [
  "about",
  "ourTeam",
  "products",
  "shop",
  "blog",
  "events",
  "contact",
  "globalNetwork",
  "careers",
  "faqs",
  "downloads",
  "gallery",
  "videoLibrary",
  "dentiumStudy",
];

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function scoreText(haystack: string, query: string): number {
  const text = haystack.toLowerCase();
  if (!query) return 0;
  if (text === query) return 100;
  if (text.startsWith(query)) return 80;
  if (text.includes(query)) return 50;
  const tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.length > 1 && tokens.every((t) => text.includes(t))) return 40;
  return 0;
}

function sortResults(results: SearchResult[], sort: string): SearchResult[] {
  const list = [...results];
  if (sort === "title") {
    return list.sort((a, b) => a.title.localeCompare(b.title));
  }
  if (sort === "date") {
    return list.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });
  }
  return list.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

export function getStaticPageResults(query: string): SearchResult[] {
  const q = normalizeQuery(query);
  if (!q) return [];

  return PUBLIC_PAGE_KEYS.flatMap((key) => {
    const page = STATIC_SEO[key];
    if (!page || "noIndex" in page && page.noIndex) return [];
    const title = page.title || key;
    const text = `${title} ${page.description}`;
    const score = scoreText(text, q);
    if (score <= 0) return [];
    return [
      {
        id: `page-${key}`,
        type: "page" as const,
        title,
        excerpt: page.description,
        href: page.path,
        score,
      },
    ];
  });
}

export function getVideoResults(query: string): SearchResult[] {
  const q = normalizeQuery(query);
  if (!q) return [];

  const results: SearchResult[] = [];

  for (const video of SITE_VIDEOS.heroSlides) {
    const score = scoreText(video.title, q);
    if (score <= 0) continue;
    results.push({
      id: `video-${video.id}`,
      type: "video",
      title: video.title,
      excerpt: "Featured video",
      href: "/video-library",
      image: video.poster,
      score,
    });
  }

  DENTIUM_STUDY_VIDEOS.forEach((title, index) => {
    const score = scoreText(title, q);
    if (score <= 0) return;
    results.push({
      id: `study-video-${index}`,
      type: "video",
      title,
      excerpt: "Clinical & product library",
      href: "/video-library",
      score,
    });
  });

  return results;
}

export async function searchSite(options: {
  query: string;
  type?: string | null;
  sort?: string | null;
  limit?: number;
  offset?: number;
}): Promise<{ results: SearchResult[]; total: number }> {
  const q = normalizeQuery(options.query);
  const limit = Math.min(Math.max(options.limit ?? 20, 1), 50);
  const offset = Math.max(options.offset ?? 0, 0);
  const typeFilter = options.type?.trim().toLowerCase() || "all";
  const sort = options.sort?.trim().toLowerCase() || "relevance";

  if (!q) {
    return { results: [], total: 0 };
  }

  const tasks: Promise<SearchResult[]>[] = [];

  if (typeFilter === "all" || typeFilter === "product") {
    tasks.push(
      prisma.product
        .findMany({
          where: {
            isActive: true,
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { shortDesc: { contains: q, mode: "insensitive" } },
              { brand: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
              { tags: { has: q } },
            ],
          },
          include: { category: true },
          take: 30,
        })
        .then((products) =>
          products.map((p) => ({
            id: p.id,
            type: "product" as const,
            title: p.name,
            excerpt: p.shortDesc || p.description.slice(0, 160),
            href: `/products/${p.slug}`,
            image: p.images[0] ?? null,
            category: p.category?.name ?? null,
            score: Math.max(
              scoreText(p.name, q),
              scoreText(p.brand ?? "", q),
              scoreText(p.sku ?? "", q),
              p.tags.some((t) => t.toLowerCase().includes(q)) ? 45 : 0
            ),
          }))
        )
        .catch(() => [])
    );
  }

  if (typeFilter === "all" || typeFilter === "blog" || typeFilter === "news") {
    const postTypes =
      typeFilter === "blog" ? (["BLOG"] as const) : typeFilter === "news" ? (["NEWS"] as const) : (["BLOG", "NEWS"] as const);

    tasks.push(
      prisma.post
        .findMany({
          where: {
            status: POST_STATUS_ACTIVE,
            type: { in: [...postTypes] },
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { excerpt: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
              { tags: { has: q } },
            ],
          },
          take: 30,
          orderBy: { publishedAt: "desc" },
        })
        .then((posts) =>
          posts.map((p) => ({
            id: p.id,
            type: (p.type === "NEWS" ? "news" : "blog") as "news" | "blog",
            title: p.title,
            excerpt: p.excerpt,
            href: `/blog/${p.slug}`,
            image: p.featuredImage,
            date: (p.publishedAt ?? p.createdAt).toISOString(),
            score: scoreText(`${p.title} ${p.excerpt ?? ""}`, q),
          }))
        )
        .catch(() => [])
    );
  }

  if (typeFilter === "all" || typeFilter === "event") {
    tasks.push(
      prisma.event
        .findMany({
          where: {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { excerpt: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } },
              { region: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 20,
          orderBy: { startDate: "desc" },
        })
        .then((events) =>
          events.map((e) => ({
            id: e.id,
            type: "event" as const,
            title: e.title,
            excerpt: e.excerpt || e.location,
            href: `/events/${e.slug}`,
            image: e.featuredImage,
            date: e.startDate.toISOString(),
            category: e.region,
            score: scoreText(`${e.title} ${e.excerpt ?? ""} ${e.location ?? ""}`, q),
          }))
        )
        .catch(() => [])
    );
  }

  if (typeFilter === "all" || typeFilter === "download") {
    tasks.push(
      prisma.downloadResource
        .findMany({
          where: {
            isActive: true,
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 15,
          orderBy: { sortOrder: "asc" },
        })
        .then((items) =>
          items.map((d) => ({
            id: d.id,
            type: "download" as const,
            title: d.title,
            excerpt: d.description,
            href: "/downloads",
            score: scoreText(`${d.title} ${d.description ?? ""}`, q),
          }))
        )
        .catch(() => [])
    );
  }

  const staticPages = typeFilter === "all" || typeFilter === "page" ? getStaticPageResults(q) : [];
  const videos = typeFilter === "all" || typeFilter === "video" ? getVideoResults(q) : [];

  const dbResults = (await Promise.all(tasks)).flat();
  const merged = sortResults([...dbResults, ...staticPages, ...videos], sort);
  const total = merged.length;

  return {
    results: merged.slice(offset, offset + limit),
    total,
  };
}

export async function suggestSearch(query: string, limit = 8): Promise<SearchResult[]> {
  const { results } = await searchSite({ query, limit: limit });
  return results;
}

export async function getSearchSuggestions(): Promise<string[]> {
  try {
    const settings = await prisma.siteSettings.findFirst({
      where: { id: "default" },
      select: { searchSuggestions: true },
    });
    if (settings?.searchSuggestions?.length) {
      return settings.searchSuggestions;
    }
  } catch {
    // ignore
  }
  return DEFAULT_SEARCH_SUGGESTIONS;
}
