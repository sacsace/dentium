import { prisma } from "@/lib/prisma";
import { getVisitorAnalytics } from "@/lib/analytics";
import { VisitorChart } from "@/components/admin/VisitorChart";
import { TopPagesTable } from "@/components/admin/TopPagesTable";
import { Eye, Users, TrendingUp, Globe, Monitor, Smartphone, Tablet } from "lucide-react";
import Link from "next/link";

async function getCmsStats() {
  try {
    const [products, posts, orders, quotes, inquiries, resumes, users, events] = await Promise.all([
      prisma.product.count(),
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.order.count(),
      prisma.quoteRequest.count(),
      prisma.contactInquiry.count({ where: { status: "PENDING" } }),
      prisma.resumeApplication.count({ where: { status: "PENDING" } }),
      prisma.user.count(),
      prisma.event.count({ where: { status: "UPCOMING" } }),
    ]);
    return { products, posts, orders, quotes, inquiries, resumes, users, events };
  } catch {
    return { products: 0, posts: 0, orders: 0, quotes: 0, inquiries: 0, resumes: 0, users: 0, events: 0 };
  }
}

function deviceIcon(device: string) {
  if (device === "mobile") return Smartphone;
  if (device === "tablet") return Tablet;
  return Monitor;
}

export default async function AdminDashboard() {
  const [analytics, cms] = await Promise.all([getVisitorAnalytics(7), getCmsStats()]);

  const visitorCards = [
    { label: "Today's Page Views", value: analytics.todayViews, icon: Eye, color: "bg-sky-500" },
    { label: "Today's Visitors", value: analytics.todayVisitors, icon: Users, color: "bg-teal-500" },
    { label: "7-Day Page Views", value: analytics.periodViews, icon: TrendingUp, color: "bg-indigo-500" },
    { label: "7-Day Visitors", value: analytics.periodVisitors, icon: Globe, color: "bg-violet-500" },
    { label: "Total Page Views", value: analytics.totalViews, icon: Eye, color: "bg-blue-500" },
    { label: "Total Visitors", value: analytics.totalVisitors, icon: Users, color: "bg-emerald-500" },
  ];

  const cmsCards = [
    { label: "Products", value: cms.products, href: "/admin/products" },
    { label: "Published Posts", value: cms.posts, href: "/admin/posts" },
    { label: "Orders", value: cms.orders, href: "/admin/orders" },
    { label: "Quote Requests", value: cms.quotes, href: "/admin/quotes" },
    { label: "Unread Inquiries", value: cms.inquiries, href: "/admin/inquiries" },
    { label: "Pending Resumes", value: cms.resumes, href: "/admin/resumes" },
    { label: "Users", value: cms.users, href: "/admin/users" },
    { label: "Upcoming Events", value: cms.events, href: "/admin/events" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-brand-navy mb-2">Dashboard</h1>
        <p className="text-brand-silver text-sm">Welcome to Dentium Admin CMS</p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-brand-navy">Visitor Analytics</h2>
          <Link href="/admin/analytics" className="text-sm text-brand-deep hover:underline">
            View full analytics →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {visitorCards.map((card) => (
            <div key={card.label} className="bg-white p-5 rounded-sm shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-sm ${card.color} text-white`}>
                  <card.icon className="w-4 h-4" />
                </div>
                <span className="text-xl font-semibold text-brand-navy">{card.value.toLocaleString()}</span>
              </div>
              <p className="text-brand-silver text-xs">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 bg-white p-6 rounded-sm shadow-sm">
            <h3 className="font-semibold text-brand-navy mb-4">Last 7 Days</h3>
            <VisitorChart data={analytics.dailyStats} />
          </div>
          <div className="bg-white p-6 rounded-sm shadow-sm">
            <h3 className="font-semibold text-brand-navy mb-4">Devices (7 days)</h3>
            {analytics.deviceBreakdown.length === 0 ? (
              <p className="text-brand-silver text-sm">No data yet.</p>
            ) : (
              <ul className="space-y-3">
                {analytics.deviceBreakdown.map((item) => {
                  const Icon = deviceIcon(item.device);
                  const total = analytics.deviceBreakdown.reduce((sum, d) => sum + d.count, 0);
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  return (
                    <li key={item.device} className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-brand-silver shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize text-brand-navy">{item.device}</span>
                          <span className="text-brand-silver">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-brand-gray rounded-full overflow-hidden">
                          <div className="h-full bg-brand-deep rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-4 bg-white p-6 rounded-sm shadow-sm">
          <h3 className="font-semibold text-brand-navy mb-4">Top Pages (7 days)</h3>
          <TopPagesTable pages={analytics.topPages} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-brand-navy mb-4">Content & Orders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cmsCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-2xl font-semibold text-brand-navy block mb-2">{card.value}</span>
              <p className="text-brand-silver text-sm">{card.label}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
