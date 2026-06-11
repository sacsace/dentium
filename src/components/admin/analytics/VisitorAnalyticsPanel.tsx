import { getVisitorAnalytics } from "@/lib/analytics";
import { VisitorChart } from "@/components/admin/VisitorChart";
import { TopPagesTable } from "@/components/admin/TopPagesTable";
import { Eye, Users, Monitor, Smartphone, Tablet } from "lucide-react";

function deviceIcon(device: string) {
  if (device === "mobile") return Smartphone;
  if (device === "tablet") return Tablet;
  return Monitor;
}

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
        <div className="bg-white p-6 rounded-sm shadow-sm">
          <h3 className="font-semibold text-brand-navy mb-4">Devices (30 days)</h3>
          {analytics.deviceBreakdown.length === 0 ? (
            <p className="text-brand-silver text-sm">No data yet.</p>
          ) : (
            <ul className="space-y-4">
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
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-sm shadow-sm">
        <h3 className="font-semibold text-brand-navy mb-4">Top Pages (30 days)</h3>
        <TopPagesTable pages={analytics.topPages} />
      </div>

      <div className="bg-white p-6 rounded-sm shadow-sm">
        <h3 className="font-semibold text-brand-navy mb-4">Recent Visits</h3>
        {analytics.recentVisits.length === 0 ? (
          <p className="text-brand-silver text-sm">No visits recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-brand-silver border-b border-brand-gray">
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Page</th>
                  <th className="pb-3 font-medium">Device</th>
                  <th className="pb-3 font-medium">Referrer</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentVisits.map((visit) => (
                  <tr key={visit.id} className="border-b border-brand-gray/60 last:border-0">
                    <td className="py-3 pr-4 text-brand-silver whitespace-nowrap">{formatDateTime(visit.createdAt)}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-brand-navy">{visit.path}</td>
                    <td className="py-3 pr-4 capitalize text-brand-silver">{visit.device || "unknown"}</td>
                    <td className="py-3 text-brand-silver text-xs truncate max-w-xs">{visit.referrer || "—"}</td>
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
