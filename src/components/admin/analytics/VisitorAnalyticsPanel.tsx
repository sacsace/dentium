import {
  ACCESS_TYPE_LABELS,
  getVisitorAnalytics,
  type AccessType,
} from "@/lib/analytics";
import { VisitorChart } from "@/components/admin/VisitorChart";
import { TopPagesTable } from "@/components/admin/TopPagesTable";
import { RecentVisitsTable } from "@/components/admin/analytics/RecentVisitsTable";
import {
  Eye,
  Users,
  Monitor,
  Smartphone,
  Tablet,
  Link2,
  Search,
  Share2,
  Globe2,
  MousePointerClick,
} from "lucide-react";

function deviceIcon(device: string) {
  if (device === "mobile") return Smartphone;
  if (device === "tablet") return Tablet;
  return Monitor;
}

function accessTypeIcon(accessType: AccessType) {
  switch (accessType) {
    case "direct":
      return MousePointerClick;
    case "internal":
      return Link2;
    case "search":
      return Search;
    case "social":
      return Share2;
    default:
      return Globe2;
  }
}

function BreakdownList({
  empty,
  children,
}: {
  empty: boolean;
  children: React.ReactNode;
}) {
  if (empty) return <p className="text-brand-silver text-sm">No data yet.</p>;
  return <ul className="space-y-4">{children}</ul>;
}

export async function VisitorAnalyticsPanel() {
  const analytics = await getVisitorAnalytics(30);

  const summary = [
    { label: "Today — Page Views", value: analytics.todayViews, icon: Eye },
    { label: "Today — Visitors", value: analytics.todayVisitors, icon: Users },
    { label: "30-Day — Page Views", value: analytics.periodViews, icon: Eye },
    { label: "30-Day — Visitors", value: analytics.periodVisitors, icon: Users },
    { label: "All-Time — Page Views", value: analytics.totalViews, icon: Eye },
    { label: "All-Time — Visitors", value: analytics.totalVisitors, icon: Users },
  ];

  const recentVisits = analytics.recentVisits.map((visit) => ({
    ...visit,
    createdAt: visit.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-brand-navy mb-1">Visitor Analytics</h2>
        <p className="text-brand-silver text-sm">Page views and unique visitors tracked on the public website.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summary.map((item) => (
          <div key={item.label} className="bg-white p-5 rounded-sm shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <item.icon className="w-4 h-4 text-brand-deep" />
              <span className="text-xs text-brand-silver">{item.label}</span>
            </div>
            <p className="text-2xl font-semibold text-brand-navy">{item.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white p-6 rounded-sm shadow-sm">
          <h3 className="font-semibold text-brand-navy mb-4">Daily Trend (30 days)</h3>
          <VisitorChart data={analytics.dailyStats} />
        </div>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-sm shadow-sm">
            <h3 className="font-semibold text-brand-navy mb-4">Devices (30 days)</h3>
            <BreakdownList empty={analytics.deviceBreakdown.length === 0}>
              {analytics.deviceBreakdown.map((item) => {
                const Icon = deviceIcon(item.device);
                return (
                  <li key={item.device} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 capitalize text-brand-navy">
                      <Icon className="w-4 h-4 text-brand-silver" />
                      {item.device}
                    </span>
                    <span className="font-semibold text-brand-navy">{item.count.toLocaleString()}</span>
                  </li>
                );
              })}
            </BreakdownList>
          </div>
          <div className="bg-white p-6 rounded-sm shadow-sm">
            <h3 className="font-semibold text-brand-navy mb-4">Access Type (30 days)</h3>
            <BreakdownList empty={analytics.accessTypeBreakdown.length === 0}>
              {analytics.accessTypeBreakdown.map((item) => {
                const Icon = accessTypeIcon(item.accessType);
                return (
                  <li key={item.accessType} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-brand-navy">
                      <Icon className="w-4 h-4 text-brand-silver" />
                      {ACCESS_TYPE_LABELS[item.accessType]}
                    </span>
                    <span className="font-semibold text-brand-navy">{item.count.toLocaleString()}</span>
                  </li>
                );
              })}
            </BreakdownList>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-sm shadow-sm">
        <h3 className="font-semibold text-brand-navy mb-4">Top Pages (30 days)</h3>
        <TopPagesTable pages={analytics.topPages} />
      </div>

      <div className="bg-white p-6 rounded-sm shadow-sm">
        <h3 className="font-semibold text-brand-navy mb-4">Recent Visits</h3>
        <RecentVisitsTable visits={recentVisits} />
      </div>
    </div>
  );
}
