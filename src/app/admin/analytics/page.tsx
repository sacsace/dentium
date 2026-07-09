import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { AnalyticsTabs } from "@/components/admin/analytics/AnalyticsTabs";
import { AnalyticsExportButtons } from "@/components/admin/analytics/AnalyticsExportButtons";
import { VisitorAnalyticsPanel } from "@/components/admin/analytics/VisitorAnalyticsPanel";
import { ProductAnalyticsPanel } from "@/components/admin/analytics/ProductAnalyticsPanel";

export const metadata = buildMetadata({
  title: "Analytics",
  path: "/admin/analytics",
  noIndex: true,
});

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

function PanelFallback() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-white rounded-sm shadow-sm animate-pulse" />
      ))}
    </div>
  );
}

export default async function AdminAnalyticsPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const activeTab = tab === "product" ? "product" : "visitor";

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-brand-navy mb-2">Analytics</h1>
          <p className="text-brand-silver text-sm">Website traffic and product performance insights.</p>
        </div>
        <AnalyticsExportButtons activeTab={activeTab} />
      </div>

      <AnalyticsTabs active={activeTab} />

      <Suspense fallback={<PanelFallback />}>
        {activeTab === "product" ? <ProductAnalyticsPanel /> : <VisitorAnalyticsPanel />}
      </Suspense>
    </div>
  );
}
