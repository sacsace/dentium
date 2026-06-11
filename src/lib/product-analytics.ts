import { prisma } from "@/lib/prisma";
import type { DailyVisitStat } from "@/lib/analytics";

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

export function extractProductSlugFromPath(path: string): string | null {
  const match = path.match(/^\/products\/([^/?#]+)$/);
  return match ? match[1] : null;
}

export type ProductStatRow = {
  productId: string;
  name: string;
  slug: string;
  categoryName: string;
  pageViews: number;
  uniqueVisitors: number;
  orderCount: number;
  unitsSold: number;
  revenue: number;
  quoteCount: number;
  quoteUnits: number;
};

export type ProductAnalytics = {
  todayProductViews: number;
  periodProductViews: number;
  periodOrders: number;
  periodUnitsSold: number;
  periodRevenue: number;
  periodQuotes: number;
  dailyProductViews: DailyVisitStat[];
  products: ProductStatRow[];
  recentSales: {
    id: string;
    orderNumber: string;
    productName: string;
    productSlug: string;
    quantity: number;
    amount: number | null;
    status: string;
    customer: string;
    createdAt: Date;
  }[];
};

function emptyProductAnalytics(days: number): ProductAnalytics {
  return {
    todayProductViews: 0,
    periodProductViews: 0,
    periodOrders: 0,
    periodUnitsSold: 0,
    periodRevenue: 0,
    periodQuotes: 0,
    dailyProductViews: buildEmptyDailyStats(days),
    products: [],
    recentSales: [],
  };
}

function pageVisitReady(): boolean {
  const model = (prisma as { pageVisit?: { count?: unknown } }).pageVisit;
  return typeof model?.count === "function";
}

export async function getProductAnalytics(days = 30): Promise<ProductAnalytics> {
  const todayStart = startOfDay(new Date());
  const rangeStart = daysAgo(days - 1);

  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        category: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    });

    const productBySlug = new Map(products.map((p) => [p.slug, p]));
    const statsMap = new Map<string, ProductStatRow>(
      products.map((p) => [
        p.id,
        {
          productId: p.id,
          name: p.name,
          slug: p.slug,
          categoryName: p.category.name,
          pageViews: 0,
          uniqueVisitors: 0,
          orderCount: 0,
          unitsSold: 0,
          revenue: 0,
          quoteCount: 0,
          quoteUnits: 0,
        },
      ])
    );

    let todayProductViews = 0;
    let periodProductViews = 0;
    const dailyMap = new Map<string, { views: number; visitors: number }>();

    if (pageVisitReady()) {
      const [todayViews, periodViews, rawDaily, rawPaths] = await Promise.all([
        prisma.pageVisit.count({
          where: {
            createdAt: { gte: todayStart },
            path: { startsWith: "/products/" },
            NOT: { path: "/products" },
          },
        }),
        prisma.pageVisit.count({
          where: {
            createdAt: { gte: rangeStart },
            path: { startsWith: "/products/" },
            NOT: { path: "/products" },
          },
        }),
        prisma.$queryRaw<{ day: Date; views: bigint; visitors: bigint }[]>`
          SELECT DATE("createdAt") AS day,
                 COUNT(*)::bigint AS views,
                 COUNT(DISTINCT "visitorKey")::bigint AS visitors
          FROM "PageVisit"
          WHERE "createdAt" >= ${rangeStart}
            AND path ~ '^/products/[^/]+$'
          GROUP BY DATE("createdAt")
          ORDER BY day ASC
        `,
        prisma.$queryRaw<{ path: string; views: bigint; visitors: bigint }[]>`
          SELECT path,
                 COUNT(*)::bigint AS views,
                 COUNT(DISTINCT "visitorKey")::bigint AS visitors
          FROM "PageVisit"
          WHERE "createdAt" >= ${rangeStart}
            AND path ~ '^/products/[^/]+$'
          GROUP BY path
        `,
      ]);

      todayProductViews = todayViews;
      periodProductViews = periodViews;

      for (const row of rawDaily) {
        dailyMap.set(row.day.toISOString().slice(0, 10), {
          views: Number(row.views),
          visitors: Number(row.visitors),
        });
      }

      for (const row of rawPaths) {
        const slug = extractProductSlugFromPath(row.path);
        if (!slug) continue;
        const product = productBySlug.get(slug);
        if (!product) continue;
        const stat = statsMap.get(product.id);
        if (!stat) continue;
        stat.pageViews = Number(row.views);
        stat.uniqueVisitors = Number(row.visitors);
      }
    }

    const dailyProductViews: DailyVisitStat[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(rangeStart);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const stat = dailyMap.get(key);
      dailyProductViews.push({
        date: key,
        views: stat?.views ?? 0,
        visitors: stat?.visitors ?? 0,
      });
    }

    const [orderItems, quoteItems, recentOrderItems] = await Promise.all([
      prisma.orderItem.findMany({
        where: { order: { createdAt: { gte: rangeStart } } },
        select: {
          productId: true,
          quantity: true,
          price: true,
          orderId: true,
        },
      }),
      prisma.quoteItem.findMany({
        where: { quoteRequest: { createdAt: { gte: rangeStart } } },
        select: {
          productId: true,
          quantity: true,
          quoteRequestId: true,
        },
      }),
      prisma.orderItem.findMany({
        where: { order: { createdAt: { gte: rangeStart } } },
        orderBy: { order: { createdAt: "desc" } },
        take: 15,
        select: {
          id: true,
          quantity: true,
          price: true,
          product: { select: { name: true, slug: true } },
          order: {
            select: {
              orderNumber: true,
              status: true,
              createdAt: true,
              guestName: true,
              user: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    const orderIdsByProduct = new Map<string, Set<string>>();
    for (const item of orderItems) {
      const stat = statsMap.get(item.productId);
      if (!stat) continue;
      stat.unitsSold += item.quantity;
      const lineTotal = item.price ? Number(item.price) * item.quantity : 0;
      stat.revenue += lineTotal;
      if (!orderIdsByProduct.has(item.productId)) {
        orderIdsByProduct.set(item.productId, new Set());
      }
      orderIdsByProduct.get(item.productId)!.add(item.orderId);
    }
    for (const [productId, orderIds] of orderIdsByProduct) {
      const stat = statsMap.get(productId);
      if (stat) stat.orderCount = orderIds.size;
    }

    const quoteIdsByProduct = new Map<string, Set<string>>();
    for (const item of quoteItems) {
      const stat = statsMap.get(item.productId);
      if (!stat) continue;
      stat.quoteUnits += item.quantity;
      if (!quoteIdsByProduct.has(item.productId)) {
        quoteIdsByProduct.set(item.productId, new Set());
      }
      quoteIdsByProduct.get(item.productId)!.add(item.quoteRequestId);
    }
    for (const [productId, quoteIds] of quoteIdsByProduct) {
      const stat = statsMap.get(productId);
      if (stat) stat.quoteCount = quoteIds.size;
    }

    const periodOrders = new Set(orderItems.map((i) => i.orderId)).size;
    const periodUnitsSold = orderItems.reduce((sum, i) => sum + i.quantity, 0);
    const periodRevenue = orderItems.reduce(
      (sum, i) => sum + (i.price ? Number(i.price) * i.quantity : 0),
      0
    );
    const periodQuotes = new Set(quoteItems.map((i) => i.quoteRequestId)).size;

    const productsList = Array.from(statsMap.values()).sort((a, b) => {
      const scoreA = a.pageViews * 2 + a.unitsSold * 10 + a.quoteCount * 5;
      const scoreB = b.pageViews * 2 + b.unitsSold * 10 + b.quoteCount * 5;
      return scoreB - scoreA;
    });

    const recentSales = recentOrderItems.map((item) => ({
      id: item.id,
      orderNumber: item.order.orderNumber,
      productName: item.product.name,
      productSlug: item.product.slug,
      quantity: item.quantity,
      amount: item.price ? Number(item.price) * item.quantity : null,
      status: item.order.status,
      customer: item.order.user?.name || item.order.guestName || "Guest",
      createdAt: item.order.createdAt,
    }));

    return {
      todayProductViews,
      periodProductViews,
      periodOrders,
      periodUnitsSold,
      periodRevenue,
      periodQuotes,
      dailyProductViews,
      products: productsList,
      recentSales,
    };
  } catch (error) {
    console.error("[product-analytics] Failed to load product stats:", error);
    return emptyProductAnalytics(days);
  }
}
