import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getVisitorAnalytics } from "@/lib/analytics";
import { getProductAnalytics } from "@/lib/product-analytics";

function toCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = req.nextUrl.searchParams.get("type") || "visitor";
  const days = Number.parseInt(req.nextUrl.searchParams.get("days") || "30", 10);
  const date = new Date().toISOString().slice(0, 10);

  if (type === "product") {
    const analytics = await getProductAnalytics(days);
    const header = [
      "Product",
      "Slug",
      "Category",
      "Page Views",
      "Unique Visitors",
      "Orders",
      "Units Sold",
      "Revenue (INR)",
      "Quote Requests",
    ];
    const rows = analytics.products.map((p) => [
      p.name,
      p.slug,
      p.categoryName,
      String(p.pageViews),
      String(p.uniqueVisitors),
      String(p.orderCount),
      String(p.unitsSold),
      String(p.revenue),
      String(p.quoteCount),
    ]);
    const csv = toCsv([header, ...rows]);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="product-analytics-${date}.csv"`,
      },
    });
  }

  const analytics = await getVisitorAnalytics(days);
  const summaryRows = [
    ["Metric", "Value"],
    ["Today's Page Views", String(analytics.todayViews)],
    ["Today's Visitors", String(analytics.todayVisitors)],
    [`${days}-Day Page Views`, String(analytics.periodViews)],
    [`${days}-Day Visitors`, String(analytics.periodVisitors)],
    ["Total Page Views", String(analytics.totalViews)],
    ["Total Visitors", String(analytics.totalVisitors)],
    [],
    ["Date", "Views", "Visitors"],
    ...analytics.dailyStats.map((d) => [d.date, String(d.views), String(d.visitors)]),
    [],
    ["Top Pages — Path", "Views", "Visitors"],
    ...analytics.topPages.map((p) => [p.path, String(p.views), String(p.visitors)]),
  ];

  const csv = toCsv(summaryRows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="visitor-analytics-${date}.csv"`,
    },
  });
}
