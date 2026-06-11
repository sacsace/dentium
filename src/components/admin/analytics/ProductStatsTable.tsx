import Link from "next/link";
import type { ProductStatRow } from "@/lib/product-analytics";
import { formatPrice } from "@/lib/utils";

type Highlight = "views" | "sales" | "all";

export function ProductStatsTable({
  rows,
  highlight = "all",
  emptyMessage = "No data yet.",
}: {
  rows: ProductStatRow[];
  highlight?: Highlight;
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return <p className="text-brand-silver text-sm py-4">{emptyMessage}</p>;
  }

  const showViews = highlight === "views" || highlight === "all";
  const showSales = highlight === "sales" || highlight === "all";
  const compact = highlight !== "all";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-brand-silver border-b border-brand-gray">
            <th className="pb-3 font-medium">Product</th>
            {!compact && <th className="pb-3 font-medium">Category</th>}
            {showViews && (
              <>
                <th className="pb-3 font-medium text-right">Views</th>
                {!compact && <th className="pb-3 font-medium text-right">Visitors</th>}
              </>
            )}
            {showSales && (
              <>
                <th className="pb-3 font-medium text-right">Orders</th>
                <th className="pb-3 font-medium text-right">Units</th>
                {!compact && <th className="pb-3 font-medium text-right">Revenue</th>}
              </>
            )}
            {!compact && <th className="pb-3 font-medium text-right">Quotes</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.productId} className="border-b border-brand-gray/60 last:border-0">
              <td className="py-3 pr-4">
                <Link
                  href={`/products/${row.slug}`}
                  className="text-brand-navy hover:text-brand-deep hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {row.name}
                </Link>
              </td>
              {!compact && <td className="py-3 pr-4 text-brand-silver">{row.categoryName}</td>}
              {showViews && (
                <>
                  <td className="py-3 text-right text-brand-navy font-medium">{row.pageViews.toLocaleString()}</td>
                  {!compact && (
                    <td className="py-3 text-right text-brand-silver">{row.uniqueVisitors.toLocaleString()}</td>
                  )}
                </>
              )}
              {showSales && (
                <>
                  <td className="py-3 text-right text-brand-navy">{row.orderCount.toLocaleString()}</td>
                  <td className="py-3 text-right text-brand-navy font-medium">{row.unitsSold.toLocaleString()}</td>
                  {!compact && (
                    <td className="py-3 text-right text-brand-silver">
                      {row.revenue > 0 ? formatPrice(row.revenue) : "—"}
                    </td>
                  )}
                </>
              )}
              {!compact && (
                <td className="py-3 text-right text-brand-silver">{row.quoteCount.toLocaleString()}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
