import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const SITE_NAME = process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Dentium";
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://www.dentium.in").replace(/\/$/, "");

export const DEFAULT_TITLE = `${SITE_NAME} | Premium Dental Implant & Digital Solutions`;

export const DEFAULT_DESCRIPTION =
  "Official Dentium website in India, operated by Implantium India Private Limited. Premium dental implants, digital dentistry solutions, and bone graft materials for dental professionals.";

export const DEFAULT_KEYWORDS = [
  "dental implants",
  "dentium india",
  "dentium bright",
  "dentium superline",
  "digital dentistry",
  "bone graft",
  "dental implant systems",
  "implantium india",
];

export const DEFAULT_OG_IMAGE =
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&h=630&fit=crop&q=80";

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function parseKeywords(value?: string | string[] | null): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.length ? value : undefined;
  const keywords = value.split(",").map((k) => k.trim()).filter(Boolean);
  return keywords.length ? keywords : undefined;
}

export type BuildMetadataOptions = {
  title?: string;
  absoluteTitle?: string;
  description?: string;
  keywords?: string | string[] | null;
  path?: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
};

export function buildMetadata(options: BuildMetadataOptions = {}): Metadata {
  const {
    title,
    absoluteTitle,
    description = DEFAULT_DESCRIPTION,
    keywords,
    path = "",
    image,
    type = "website",
    publishedTime,
    modifiedTime,
    authors,
    noIndex = false,
  } = options;

  const canonical = absoluteUrl(path);
  const resolvedImage = image || DEFAULT_OG_IMAGE;
  const imageUrl = resolvedImage.startsWith("http") ? resolvedImage : absoluteUrl(resolvedImage);
  const pageTitle = absoluteTitle || (title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE);

  const openGraph = {
    type,
    locale: "en_IN" as const,
    alternateLocale: ["en_US"],
    url: canonical,
    siteName: SITE_NAME,
    title: pageTitle,
    description,
    images: [{ url: imageUrl, width: 1200, height: 630, alt: title || SITE_NAME }],
    ...(type === "article"
      ? { publishedTime, modifiedTime, authors }
      : {}),
  };

  const metadata: Metadata = {
    description,
    keywords: parseKeywords(keywords) ?? DEFAULT_KEYWORDS,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
        },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [imageUrl],
    },
  };

  if (absoluteTitle) {
    metadata.title = { absolute: absoluteTitle };
  } else if (title) {
    metadata.title = title;
  } else {
    metadata.title = { absolute: DEFAULT_TITLE };
  }

  return metadata;
}

export async function getSiteSeoSettings() {
  try {
    return await prisma.siteSettings.findFirst({
      select: { seoTitle: true, seoDescription: true, seoKeywords: true },
    });
  } catch {
    return null;
  }
}

export const STATIC_SEO = {
  home: {
    title: undefined as string | undefined,
    description:
      "Official Dentium website in India. Premium dental implant systems, B2B shop, clinical education, and global network — operated by Implantium India Private Limited.",
    path: "/",
  },
  about: {
    title: "About Us",
    description:
      "Learn about Implantium India Private Limited, the official Dentium operating company in India — our overview, mission, and vision as part of the global Dentium network.",
    path: "/about",
  },
  ourTeam: {
    title: "Our Team",
    description:
      "Meet the Dentium India team — professionals supporting dental clinicians with implant systems, education, and customer care.",
    path: "/our-team",
  },
  products: {
    title: "Products",
    description:
      "Explore Dentium Bright and SuperLine implant systems, abutments, fixtures, and surgical kits. Login for B2B pricing.",
    path: "/products",
  },
  shop: {
    title: "Shop",
    description:
      "Browse and order Dentium dental products online. Request quotes for B2B pricing and bulk orders.",
    path: "/shop",
  },
  blog: {
    title: "Blog & News",
    description:
      "Latest clinical blogs, newsroom updates, and dental implant case insights from Dentium.",
    path: "/blog",
  },
  events: {
    title: "Events & Seminars",
    description:
      "Upcoming Dentium seminars, workshops, and dental education events across India.",
    path: "/events",
  },
  contact: {
    title: "Contact Us",
    description:
      "Contact Dentium in India for product inquiries, partnerships, careers, and customer support in Gurugram, Haryana.",
    path: "/contact",
  },
  globalNetwork: {
    title: "Global Network",
    description:
      "Dentium global network serving 80+ countries. Find Dentium offices in India, Asia, Europe, Americas, and Oceania.",
    path: "/global-network",
  },
  careers: {
    title: "Careers",
    description: "Explore career opportunities with Dentium India. We are hiring talented professionals in Sales, HR, Administration, Marketing, Logistics, and Customer Support.",
    path: "/careers",
  },
  faqs: {
    title: "FAQs",
    description: "Frequently asked questions about Dentium products, orders, registration, and support in India.",
    path: "/faqs",
  },
  downloads: {
    title: "Downloads",
    description: "Download brochures, IFU documents, and product resources from Dentium.",
    path: "/downloads",
  },
  gallery: {
    title: "Gallery",
    description: "Photo gallery of Dentium products, events, and clinical education in India.",
    path: "/gallery",
  },
  videoLibrary: {
    title: "Video Library",
    description: "Watch Dentium clinical videos, surgical techniques, and product demonstrations.",
    path: "/video-library",
  },
  dentiumStudy: {
    title: "Dentium Study",
    description:
      "Dental education hub with implant workflows, surgical kits, CBCT software tutorials, and clinical techniques.",
    path: "/dentium-study",
  },
  privacy: {
    title: "Privacy Policy",
    description: `Privacy policy for www.dentium.in, operated by Implantium India Private Limited. Last updated 5th November 2025.`,
    path: "/privacy",
  },
  terms: {
    title: "Terms & Conditions",
    description: `Terms and conditions for using ${SITE_URL.replace(/^https?:\/\//, "")}, operated by Implantium India Private Limited.`,
    path: "/terms",
  },
  orderTracking: {
    title: "Order Tracking",
    description: "Track your Dentium order status and delivery updates.",
    path: "/order-tracking",
    noIndex: true,
  },
  login: {
    title: "Sign In",
    description: "Sign in to your Dentium B2B account for pricing, orders, and quotes.",
    path: "/auth/login",
    noIndex: true,
  },
  register: {
    title: "Create Account",
    description: "Register for a Dentium B2B account with GSTIN and DCI verification.",
    path: "/auth/register",
    noIndex: true,
  },
  forgotPassword: {
    title: "Forgot Password",
    description: "Reset your Dentium account password.",
    path: "/auth/forgot-password",
    noIndex: true,
  },
  cart: {
    title: "Shopping Cart",
    description: "Review items in your Dentium shopping cart.",
    path: "/shop/cart",
    noIndex: true,
  },
  account: {
    title: "My Account",
    description: "Manage your Dentium profile, orders, and quotes.",
    path: "/account",
    noIndex: true,
  },
} as const;

export function staticPageMetadata(key: keyof typeof STATIC_SEO): Metadata {
  const page = STATIC_SEO[key];
  return buildMetadata({
    title: "title" in page ? page.title : undefined,
    description: page.description,
    path: page.path,
    noIndex: "noIndex" in page ? page.noIndex : false,
  });
}
