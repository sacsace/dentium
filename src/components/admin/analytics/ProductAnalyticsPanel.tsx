import Link from "next/link";
import { getProductAnalytics } from "@/lib/product-analytics";
import { VisitorChart } from "@/components/admin/VisitorChart";
import { ProductStatsTable } from "@/components/admin/analytics/ProductStatsTable";
import { formatPrice } from "@/lib/utils";
import { Eye, ShoppingBag, Package, IndianRupee, FileText } from "lucide-react";

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function ProductAnalyticsPanel() {
  const analytics = await getProductAnalytics(30);

  const summary = [
    { label: "Today — Product Views", value: analytics.todayProductViews, icon: Eye },
    { label: "30-Day — Product Views", value: analytics.periodProductViews, icon: Eye },
    { label: "30-Day — Orders", value: analytics.periodOrders, icon: ShoppingBag },
    { label: "30-Day — Units Sold", value: analytics.periodUnitsSold, icon: Package },
    { label: "30-Day — Revenue", value: formatPrice(analytics.periodRevenue), icon: IndianRupee, isText: true },
    { label: "30-Day — Quote Requests", value: analytics.periodQuotes, icon: FileText },
  ];

  const topByViews = [...analytics.products]
    .filter((p) => p.pageViews > 0)
    .sort((a, b) => b.pageViews - a.pageViews)
    .slice(0, 10);

  const topBySales = [...analytics.products]
    .filter((p) => p.unitsSold > 0)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-brand-navy mb-1">Product Analytics</h2>
        <p className="text-brand-silver text-sm">
          Product page views from visitor tracking, plus orders and quote requests from the last 30 days.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summary.map((item) => (
          <div key={item.label} className="bg-white p-5 rounded-sm shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <item.icon className="w-4 h-4 text-brand-deep" />
              <span className="text-xs text-brand-silver">{item.label}</span>
            </div>
            <p className="text-2xl font-semibold text-brand-navy">
              {item.isText ? item.value : Number(item.value).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-sm shadow-sm">
        <h3 className="font-semibold text-brand-navy mb-4">Product Page Views (30 days)</h3>
        <VisitorChart data={analytics.dailyProductViews} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-sm shadow-sm">
          <h3 className="font-semibold text-brand-navy mb-4">Top Products by Views</h3>
          <ProductStatsTable
            rows={topByViews}
            highlight="views"
            emptyMessage="No product page views recorded yet."
          />
        </div>
        <div className="bg-white p-6 rounded-sm shadow-sm">
          <h3 className="font-semibold text-brand-navy mb-4">Top Products by Sales</h3>
          <ProductStatsTable
            rows={topBySales}
            highlight="sales"
            emptyMessage="No product orders in the last 30 days."
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-sm shadow-sm">
        <h3 className="font-semibold text-brand-navy mb-4">All Products (30 days)</h3>
        <ProductStatsTable rows={analytics.products} highlight="all" />
      </div>

      <div className="bg-white p-6 rounded-sm shadow-sm">
        <h3 className="font-semibold text-brand-navy mb-4">Recent Sales (30 days)</h3>
        {analytics.recentSales.length === 0 ? (
          <p className="text-brand-silver text-sm">No orders recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-brand-silver border-b border-brand-gray">
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium text-right">Qty</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-brand-gray/60 last:border-0">
                    <td className="py-3 pr-4 text-brand-silver whitespace-nowrap">{formatDateTime(sale.createdAt)}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-brand-navy">{sale.orderNumber}</td>
                    <td className="py-3 pr-4">
                      <Link
                        href={`/products/${sale.productSlug}`}
                        className="text-brand-deep hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {sale.productName}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-right text-brand-navy">{sale.quantity}</td>
                    <td className="py-3 pr-4 text-right text-brand-navy">
                      {sale.amount != null ? formatPrice(sale.amount) : "—"}
                    </td>
                    <td className="py-3 pr-4 text-brand-silver">{sale.customer}</td>
                    <td className="py-3 capitalize text-brand-silver text-xs">{sale.status.replace(/_/g, " ").toLowerCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
