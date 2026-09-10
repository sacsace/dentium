import { prisma } from "@/lib/prisma";
import {
  ACCESS_TYPE_LABELS,
  RECENT_VISITS_MAX,
  classifyAccessType,
  type AccessType,
} from "@/lib/analytics-access";

export {
  ACCESS_TYPE_LABELS,
  RECENT_VISITS_MAX,
  RECENT_VISITS_PAGE_SIZE,
  classifyAccessType,
  type AccessType,
} from "@/lib/analytics-access";

const BOT_PATTERN =
  /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|bingpreview|headless|lighthouse|pagespeed|wget|curl\/|python-requests/i;

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return BOT_PATTERN.test(userAgent);
}

export function detectDevice(userAgent: string | null | undefined): string {
  if (!userAgent) return "unknown";
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(userAgent)) return "mobile";
  return "desktop";
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(days: number): Date {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - days);
  return d;
}

function buildEmptyDailyStats(days: number): DailyVisitStat[] {
  const rangeStart = daysAgo(days - 1);
  const dailyStats: DailyVisitStat[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i);
    dailyStats.push({ date: d.toISOString().slice(0, 10), views: 0, visitors: 0 });
  }
  return dailyStats;
}

/** Prisma client may be stale until `npm run db:generate` + dev server restart */
function pageVisitReady(): boolean {
  const model = (prisma as { pageVisit?: { count?: unknown } }).pageVisit;
  return typeof model?.count === "function";
}

export type DailyVisitStat = {
  date: string;
  views: number;
  visitors: number;
};

export type TopPageStat = {
  path: string;
  views: number;
  visitors: number;
};

export type VisitorAnalytics = {
  todayViews: number;
  todayVisitors: number;
  periodViews: number;
  periodVisitors: number;
  totalViews: number;
  totalVisitors: number;
  dailyStats: DailyVisitStat[];
  topPages: TopPageStat[];
  deviceBreakdown: { device: string; count: number }[];
  accessTypeBreakdown: { accessType: AccessType; count: number }[];
  recentVisits: {
    id: string;
    path: string;
    device: string | null;
    referrer: string | null;
    accessType: AccessType;
    createdAt: Date;
  }[];
};

function emptyAnalytics(days: number): VisitorAnalytics {
  return {
    todayViews: 0,
    todayVisitors: 0,
    periodViews: 0,
    periodVisitors: 0,
    totalViews: 0,
    totalVisitors: 0,
    dailyStats: buildEmptyDailyStats(days),
    topPages: [],
    deviceBreakdown: [],
    accessTypeBreakdown: [],
    recentVisits: [],
  };
}

function buildAccessTypeBreakdown(
  rows: { referrer: string | null }[]
): { accessType: AccessType; count: number }[] {
  const counts = new Map<AccessType, number>();
  for (const row of rows) {
    const type = classifyAccessType(row.referrer);
    counts.set(type, (counts.get(type) || 0) + 1);
  }
  return (Object.keys(ACCESS_TYPE_LABELS) as AccessType[])
    .map((accessType) => ({ accessType, count: counts.get(accessType) || 0 }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
}

async function countUniqueVisitors(since?: Date): Promise<number> {
  if (!pageVisitReady()) return 0;
  const where = since ? { createdAt: { gte: since } } : undefined;
  const groups = await prisma.pageVisit.groupBy({
    by: ["visitorKey"],
    where,
  });
  return groups.length;
}

export async function getVisitorAnalytics(days = 7): Promise<VisitorAnalytics> {
  if (!pageVisitReady()) {
    console.warn(
      "[analytics] PageVisit model missing. Run: npm run db:push && npm run db:generate — then restart the dev server."
    );
    return emptyAnalytics(days);
  }

  const todayStart = startOfDay(new Date());
  const rangeStart = daysAgo(days - 1);

  try {
    const [
      todayViews,
      todayVisitors,
      weekViews,
      weekVisitors,
      totalViews,
      totalVisitors,
      rawDaily,
      rawTopPages,
      rawDevices,
      periodReferrers,
      recentVisitsRaw,
    ] = await Promise.all([
      prisma.pageVisit.count({ where: { createdAt: { gte: todayStart } } }),
      countUniqueVisitors(todayStart),
      prisma.pageVisit.count({ where: { createdAt: { gte: rangeStart } } }),
      countUniqueVisitors(rangeStart),
      prisma.pageVisit.count(),
      countUniqueVisitors(),
      prisma.$queryRaw<{ day: Date; views: bigint; visitors: bigint }[]>`
        SELECT DATE("createdAt") AS day,
               COUNT(*)::bigint AS views,
               COUNT(DISTINCT "visitorKey")::bigint AS visitors
        FROM "PageVisit"
        WHERE "createdAt" >= ${rangeStart}
        GROUP BY DATE("createdAt")
        ORDER BY day ASC
      `,
      prisma.$queryRaw<{ path: string; views: bigint; visitors: bigint }[]>`
        SELECT path,
               COUNT(*)::bigint AS views,
               COUNT(DISTINCT "visitorKey")::bigint AS visitors
        FROM "PageVisit"
        WHERE "createdAt" >= ${rangeStart}
        GROUP BY path
        ORDER BY views DESC
        LIMIT 10
      `,
      prisma.pageVisit.groupBy({
        by: ["device"],
        where: { createdAt: { gte: rangeStart } },
        _count: { _all: true },
        orderBy: { _count: { device: "desc" } },
      }),
      prisma.pageVisit.findMany({
        where: { createdAt: { gte: rangeStart } },
        select: { referrer: true },
      }),
      prisma.pageVisit.findMany({
        orderBy: { createdAt: "desc" },
        take: RECENT_VISITS_MAX,
        select: {
          id: true,
          path: true,
          device: true,
          referrer: true,
          createdAt: true,
        },
      }),
    ]);

    const dailyMap = new Map(
      rawDaily.map((row) => [
        row.day.toISOString().slice(0, 10),
        { views: Number(row.views), visitors: Number(row.visitors) },
      ])
    );

    const dailyStats: DailyVisitStat[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(rangeStart);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const stat = dailyMap.get(key);
      dailyStats.push({
        date: key,
        views: stat?.views ?? 0,
        visitors: stat?.visitors ?? 0,
      });
    }

    return {
      todayViews,
      todayVisitors,
      periodViews: weekViews,
      periodVisitors: weekVisitors,
      totalViews,
      totalVisitors,
      dailyStats,
      topPages: rawTopPages.map((row) => ({
        path: row.path,
        views: Number(row.views),
        visitors: Number(row.visitors),
      })),
      deviceBreakdown: rawDevices.map((row) => ({
        device: row.device || "unknown",
        count: row._count._all,
      })),
      accessTypeBreakdown: buildAccessTypeBreakdown(periodReferrers),
      recentVisits: recentVisitsRaw.map((visit) => ({
        ...visit,
        accessType: classifyAccessType(visit.referrer),
      })),
    };
  } catch (error) {
    console.error("[analytics] Failed to load visitor stats:", error);
    return emptyAnalytics(days);
  }
}

export async function trackPageVisit(data: {
  path: string;
  referrer?: string;
  visitorKey: string;
  userAgent?: string;
}): Promise<void> {
  if (isBotUserAgent(data.userAgent) || !pageVisitReady()) return;

  try {
    await prisma.pageVisit.create({
      data: {
        path: data.path.slice(0, 500),
        referrer: data.referrer?.slice(0, 500),
        visitorKey: data.visitorKey.slice(0, 100),
        userAgent: data.userAgent?.slice(0, 500),
        device: detectDevice(data.userAgent),
      },
    });
  } catch (error) {
    console.error("[analytics] Failed to track visit:", error);
  }
}
