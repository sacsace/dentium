import { staticPageMetadata } from "@/lib/seo";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate, formatPrice } from "@/lib/utils";
import Link from "next/link";
import { AccountProfileForm } from "@/components/account/AccountProfileForm";

export const metadata = staticPageMetadata("account");

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  let profile = null;
  let orders: Awaited<ReturnType<typeof prisma.order.findMany>> = [];
  let quotes: Awaited<ReturnType<typeof prisma.quoteRequest.findMany>> = [];

  try {
    const [user, orderList, quoteList] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.id },
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          company: true,
          phone: true,
          gstin: true,
          dciNumber: true,
          panNumber: true,
          state: true,
          city: true,
          pincode: true,
        },
      }),
      prisma.order.findMany({
        where: { userId: session.id },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.quoteRequest.findMany({
        where: { userId: session.id },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    profile = user;
    orders = orderList;
    quotes = quoteList;
  } catch {
    // DB not connected
  }

  return (
    <>
      <PageHeader
        title={`Welcome, ${session.name}`}
        subtitle="My Account"
        description="Manage your profile anytime. Company and address details are optional until checkout."
      />

      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          {profile && <AccountProfileForm profile={profile} />}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-brand-gray p-6 rounded-xl text-center">
              <p className="text-2xl font-semibold text-brand-deep">{orders.length}</p>
              <p className="text-brand-silver text-sm">Orders</p>
            </div>
            <div className="bg-brand-gray p-6 rounded-xl text-center">
              <p className="text-2xl font-semibold text-brand-deep">{quotes.length}</p>
              <p className="text-brand-silver text-sm">Quote Requests</p>
            </div>
            <Link
              href="/shop"
              className="bg-brand-accent text-brand-navy p-6 rounded-xl text-center hover:bg-brand-accent-dark transition-colors"
            >
              <p className="text-sm font-medium">Browse Products →</p>
            </Link>
          </div>

          <h2 className="text-xl font-semibold text-brand-navy tracking-tight mb-4">Recent Orders</h2>
          {orders.length > 0 ? (
            <div className="space-y-3 mb-12">
              {orders.map((order) => (
                <div key={order.id} className="bg-brand-gray p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-medium text-brand-navy">{order.orderNumber}</p>
                    <p className="text-brand-silver text-sm">
                      {formatDate(order.createdAt)} · {order.status}
                    </p>
                  </div>
                  {order.totalAmount && (
                    <p className="text-brand-deep font-medium">{formatPrice(Number(order.totalAmount))}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-brand-silver text-sm mb-12">No orders yet.</p>
          )}

          <h2 className="text-xl font-semibold text-brand-navy tracking-tight mb-4">Quote Requests</h2>
          {quotes.length > 0 ? (
            <div className="space-y-3">
              {quotes.map((quote) => (
                <div key={quote.id} className="bg-brand-gray p-4 rounded-xl">
                  <p className="font-medium text-brand-navy">{quote.quoteNumber}</p>
                  <p className="text-brand-silver text-sm">
                    {formatDate(quote.createdAt)} · {quote.status}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-brand-silver text-sm">No quote requests yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
