export type AccessType = "direct" | "internal" | "search" | "social" | "referral";

const SEARCH_HOSTS =
  /google\.|bing\.|yahoo\.|duckduckgo\.|baidu\.|yandex\.|naver\.|daum\./i;
const SOCIAL_HOSTS =
  /facebook\.|fb\.com|instagram\.|twitter\.|x\.com|linkedin\.|t\.co|youtube\.|youtu\.be|whatsapp\.|telegram\./i;

function isInternalHost(hostname: string): boolean {
  const siteHost = (() => {
    try {
      return new URL(
        (typeof process !== "undefined" && process.env.NEXT_PUBLIC_APP_URL?.trim()
          ? process.env.NEXT_PUBLIC_APP_URL.trim()
          : "https://www.dentium.in"
        ).replace(/\/$/, "")
      ).hostname.replace(/^www\./, "");
    } catch {
      return "dentium.in";
    }
  })();
  const host = hostname.replace(/^www\./, "").toLowerCase();
  if (host === "localhost" || host === "127.0.0.1") return true;
  return host === siteHost || host.endsWith(`.${siteHost}`);
}

/** Classify visit source from document.referrer (접속 유형). */
export function classifyAccessType(referrer: string | null | undefined): AccessType {
  if (!referrer?.trim()) return "direct";
  try {
    const { hostname } = new URL(referrer);
    if (isInternalHost(hostname)) return "internal";
    if (SEARCH_HOSTS.test(hostname)) return "search";
    if (SOCIAL_HOSTS.test(hostname)) return "social";
    return "referral";
  } catch {
    return "referral";
  }
}

export const ACCESS_TYPE_LABELS: Record<AccessType, string> = {
  direct: "Direct",
  internal: "Internal",
  search: "Search",
  social: "Social",
  referral: "Referral",
};

export const RECENT_VISITS_PAGE_SIZE = 15;
export const RECENT_VISITS_MAX = 45;
