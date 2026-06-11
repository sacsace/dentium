import { SITE, BRAND_LOGOS } from "@/lib/site-config";
import { absoluteUrl, SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { resolvePostFeaturedImage } from "@/lib/post-images";

type JsonLd = Record<string, unknown>;

export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE.legalName,
    alternateName: [SITE.brand, `${SITE.brand} India`],
    brand: {
      "@type": "Brand",
      name: SITE.brand,
    },
    url: SITE_URL,
    logo: absoluteUrl(BRAND_LOGOS.primary),
    description: SITE.about,
    email: SITE.email,
    telephone: SITE.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "804-805-806, The Palm Spring Plaza Building, Golf Course Road, Sector 54",
      addressLocality: "Gurugram",
      addressRegion: "Haryana",
      postalCode: "122002",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.dentium.in",
      "https://www.dentium.com",
      "https://dentium.co.in",
    ],
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productSchema(product: {
  name: string;
  slug: string;
  description: string;
  shortDesc?: string | null;
  images: string[];
  sku?: string | null;
  brand?: string | null;
  price?: unknown;
  showPrice?: boolean;
}): JsonLd {
  const image = product.images[0] || DEFAULT_OG_IMAGE;
  const schema: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDesc || product.description.slice(0, 500),
    image: image.startsWith("http") ? image : absoluteUrl(image),
    sku: product.sku || product.slug,
    brand: {
      "@type": "Brand",
      name: product.brand || "Dentium",
    },
    url: absoluteUrl(`/products/${product.slug}`),
  };

  return schema;
}

export function articleSchema(post: {
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  featuredImage?: string | null;
  authorName?: string | null;
  publishedAt?: Date | null;
  updatedAt?: Date;
  type?: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": post.type === "NEWS" ? "NewsArticle" : "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    image: resolvePostFeaturedImage(post) || DEFAULT_OG_IMAGE,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: (post.updatedAt || post.publishedAt)?.toISOString(),
    author: {
      "@type": "Organization",
      name: post.authorName || SITE_NAME,
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    inLanguage: "en-IN",
  };
}

export function eventSchema(event: {
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  location?: string | null;
  startDate: Date;
  endDate?: Date | null;
  registrationUrl?: string | null;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.excerpt || undefined,
    image: event.featuredImage || DEFAULT_OG_IMAGE,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate?.toISOString(),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: event.location
      ? { "@type": "Place", name: event.location, address: event.location }
      : undefined,
    organizer: { "@id": `${SITE_URL}/#organization` },
    url: event.registrationUrl || absoluteUrl(`/events/${event.slug}`),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
