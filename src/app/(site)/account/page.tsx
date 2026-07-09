import { staticPageMetadata } from "@/lib/seo";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import type { AccountOrder } from "@/components/account/PurchaseHistorySection";
import type { UserProfile } from "@/lib/profile";

export const metadata = staticPageMetadata("account");

type OrderWithItems = Awaited<
  ReturnType<
    typeof prisma.order.findMany<{
      include: { items: { include: { product: true } } };
    }>
  >
>[number];

function serializeOrder(order: OrderWithItems): AccountOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalAmount: order.totalAmount != null ? Number(order.totalAmount) : null,
    subtotalAmount: order.subtotalAmount != null ? Number(order.subtotalAmount) : null,
    taxAmount: order.taxAmount != null ? Number(order.taxAmount) : null,
    shippingAmount: order.shippingAmount != null ? Number(order.shippingAmount) : null,
    couponCode: order.couponCode,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      quantity: item.quantity,
      price: item.price != null ? Number(item.price) : null,
      variantLabel: item.variantLabel,
      product: { name: item.product.name },
    })),
  };
}

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  let profile: UserProfile | null = null;
  let orders: AccountOrder[] = [];
  let trackingOrders: {
    id: string;
    orderNumber: string;
    status: AccountOrder["status"];
    totalAmount: string | number | null;
    carrier: string | null;
    trackingNumber: string | null;
    shippedAt: string | null;
    createdAt: string;
  }[] = [];

  try {
    const [user, orderList] = await Promise.all([
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
          erpCustomerNumber: true,
          gstin: true,
          dciNumber: true,
          panNumber: true,
          state: true,
          city: true,
          pincode: true,
          membershipTier: true,
          licenseDocumentUrl: true,
          fullMemberStatus: true,
          fullMemberReviewNote: true,
          fullMemberRequestedAt: true,
        },
      }),
      prisma.order.findMany({
        where: { userId: session.id },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    profile = user;
    orders = orderList.map(serializeOrder);
    trackingOrders = orderList.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      totalAmount: o.totalAmount != null ? Number(o.totalAmount) : null,
      carrier: o.carrier,
      trackingNumber: o.trackingNumber,
      shippedAt: o.shippedAt?.toISOString() ?? null,
      createdAt: o.createdAt.toISOString(),
    }));
  } catch {
    // DB not connected
  }

  if (!profile) {
    return (
      <>
        <PageHeader title="My Account" subtitle="Account" />
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 text-brand-silver text-sm">
            Unable to load account data. Please try again later.
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Welcome, ${session.name}`}
        subtitle="My Account"
        description="Manage your profile, orders, shipping, returns, and ledger requests."
      />

      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <Suspense fallback={<div className="text-brand-silver text-sm">Loading account...</div>}>
            <AccountDashboard profile={profile} orders={orders} trackingOrders={trackingOrders} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
