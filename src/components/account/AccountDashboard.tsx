"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Building2,
  ShoppingBag,
  Truck,
  RotateCcw,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCOUNT_SECTIONS, getAccountSection, isAccountSectionId, type AccountSectionId } from "@/lib/account-sections";
import type { UserProfile } from "@/lib/profile";
import { AccountProfileForm } from "@/components/account/AccountProfileForm";
import { PurchaseHistorySection, type AccountOrder } from "@/components/account/PurchaseHistorySection";
import { ShippingTrackingSection } from "@/components/account/ShippingTrackingSection";
import { ReturnExchangeSection } from "@/components/account/ReturnExchangeSection";
import { LedgerRequestSection } from "@/components/account/LedgerRequestSection";
import type { OrderStatus } from "@prisma/client";

const SECTION_ICONS: Record<AccountSectionId, typeof User> = {
  personal: User,
  company: Building2,
  orders: ShoppingBag,
  tracking: Truck,
  returns: RotateCcw,
  ledger: FileSpreadsheet,
};

type AccountDashboardProps = {
  profile: UserProfile;
  orders: AccountOrder[];
  trackingOrders: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: string | number | null;
    carrier: string | null;
    trackingNumber: string | null;
    shippedAt: string | null;
    createdAt: string;
  }[];
};

export function AccountDashboard({ profile, orders, trackingOrders }: AccountDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeSection: AccountSectionId = isAccountSectionId(tabParam) ? tabParam : "personal";
  const sectionMeta = useMemo(() => getAccountSection(activeSection), [activeSection]);

  const setSection = useCallback(
    (id: AccountSectionId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", id);
      router.replace(`/account?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] gap-6 md:gap-8 items-start">
      <nav className="md:sticky md:top-28 shrink-0" aria-label="Account menu">
        <div className="md:hidden grid grid-cols-2 gap-2">
          {ACCOUNT_SECTIONS.map((section) => {
            const Icon = SECTION_ICONS[section.id];
            const active = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setSection(section.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition-colors",
                  active
                    ? "bg-brand-accent text-brand-navy border-brand-accent"
                    : "bg-white text-brand-silver border-gray-200"
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="leading-snug line-clamp-2">{section.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden md:block bg-white border border-gray-100 rounded-2xl shadow-sm p-2">
          {ACCOUNT_SECTIONS.map((section) => {
            const Icon = SECTION_ICONS[section.id];
            const active = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] text-left transition-colors",
                  active
                    ? "bg-brand-accent text-brand-navy font-medium"
                    : "text-brand-silver hover:text-brand-navy hover:bg-brand-gray/60"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="leading-snug">{section.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="min-w-0">
        <header className="mb-6">
          <h2 className="text-xl font-semibold text-brand-navy tracking-tight">{sectionMeta.label}</h2>
          <p className="text-brand-silver text-sm mt-1">{sectionMeta.description}</p>
        </header>

        {activeSection === "personal" && <AccountProfileForm profile={profile} view="personal" />}
        {activeSection === "company" && <AccountProfileForm profile={profile} view="company" />}
        {activeSection === "orders" && <PurchaseHistorySection orders={orders} />}
        {activeSection === "tracking" && <ShippingTrackingSection orders={trackingOrders} />}
        {activeSection === "returns" && (
          <ReturnExchangeSection
            embedded
            orders={orders.map((o) => ({ id: o.id, orderNumber: o.orderNumber }))}
          />
        )}
        {activeSection === "ledger" && <LedgerRequestSection embedded defaultGstin={profile.gstin} />}
      </div>
    </div>
  );
}
