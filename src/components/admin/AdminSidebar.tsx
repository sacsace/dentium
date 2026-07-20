"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  Download,
  Calendar,
  Image,
  Images,
  ShoppingCart,
  MessageSquare,
  Mail,
  Users,
  Settings,
  LogOut,
  Globe,
  BarChart3,
  Briefcase,
  History,
  UserCircle,
  X,
  Tag,
  PanelTop,
  RotateCcw,
  FileSpreadsheet,
  Gift,
  Database,
  ChevronDown,
  Store,
  Layers,
  Building2,
  Cog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearCartOnLogout } from "@/components/cart/CartAuthSync";
import { DentiumLogo } from "@/components/brand/DentiumLogo";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useLanguage } from "@/i18n/LanguageProvider";

type MenuItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badgeKey?: keyof NavBadges;
};

type MenuSection = {
  id: string;
  title: string;
  icon: typeof LayoutDashboard;
  items: MenuItem[];
};

const topLinks: MenuItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

const menuSections: MenuSection[] = [
  {
    id: "shop",
    title: "Shop",
    icon: Store,
    items: [
      { label: "Categories", href: "/admin/categories", icon: FolderTree },
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Coupons", href: "/admin/coupons", icon: Tag },
      { label: "Promotions", href: "/admin/promotions", icon: Gift },
      { label: "Coupon Emails", href: "/admin/coupon-emails", icon: Mail },
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart, badgeKey: "orders" },
      { label: "Returns", href: "/admin/returns", icon: RotateCcw },
      { label: "Ledger", href: "/admin/ledger", icon: FileSpreadsheet },
      { label: "Quote Requests", href: "/admin/quotes", icon: ShoppingCart },
    ],
  },
  {
    id: "content",
    title: "Content",
    icon: Layers,
    items: [
      { label: "Blog / News", href: "/admin/posts", icon: FileText },
      { label: "Downloads", href: "/admin/downloads", icon: Download },
      { label: "Gallery", href: "/admin/gallery", icon: Images },
      { label: "Events", href: "/admin/events", icon: Calendar },
      { label: "Hero Banners", href: "/admin/banners", icon: Image },
      { label: "Popups", href: "/admin/popups", icon: PanelTop },
    ],
  },
  {
    id: "communication",
    title: "Communication",
    icon: MessageSquare,
    items: [
      { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
      { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
      { label: "Job Postings", href: "/admin/jobs", icon: Briefcase },
      { label: "Resumes", href: "/admin/resumes", icon: Briefcase },
    ],
  },
  {
    id: "company",
    title: "Company",
    icon: Building2,
    items: [
      { label: "Global Offices", href: "/admin/offices", icon: Globe },
      { label: "Company History", href: "/admin/company-history", icon: History },
      { label: "Team Members", href: "/admin/team-members", icon: UserCircle },
    ],
  },
  {
    id: "system",
    title: "System",
    icon: Cog,
    items: [
      { label: "ERP Customers", href: "/admin/erp-customers", icon: Database },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

type NavBadges = { orders: number };

function isItemActive(pathname: string, href: string) {
  return pathname === href || (href !== "/admin" && pathname.startsWith(href));
}

function findSectionForPath(pathname: string): string | null {
  for (const section of menuSections) {
    if (section.items.some((item) => isItemActive(pathname, item.href))) {
      return section.id;
    }
  }
  return null;
}

function formatBadgeCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

function NavBadge({ count, subtle }: { count: number; subtle?: boolean }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "ml-auto shrink-0 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full text-[9px] font-bold leading-none inline-flex items-center justify-center",
        subtle ? "bg-brand-accent/90 text-brand-navy" : "bg-brand-accent text-brand-navy"
      )}
    >
      {formatBadgeCount(count)}
    </span>
  );
}

function sectionBadgeCount(section: MenuSection, badges: NavBadges) {
  return section.items.reduce((sum, item) => {
    if (!item.badgeKey) return sum;
    return sum + (badges[item.badgeKey] ?? 0);
  }, 0);
}

type AdminSidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

export function AdminSidebar({ mobileOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [badges, setBadges] = useState<NavBadges>({ orders: 0 });
  const activeSection = useMemo(() => findSectionForPath(pathname), [pathname]);
  const [openSection, setOpenSection] = useState<string | null>(activeSection);

  useEffect(() => {
    if (activeSection) setOpenSection(activeSection);
  }, [activeSection]);

  const loadBadges = useCallback(() => {
    fetch("/api/admin/nav-badges")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.orders === "number") setBadges({ orders: data.orders });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadBadges();
  }, [loadBadges, pathname]);

  useEffect(() => {
    const onFocus = () => loadBadges();
    const onRefresh = () => loadBadges();
    window.addEventListener("focus", onFocus);
    window.addEventListener("admin:nav-badges-refresh", onRefresh);
    const interval = window.setInterval(loadBadges, 60_000);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("admin:nav-badges-refresh", onRefresh);
      window.clearInterval(interval);
    };
  }, [loadBadges]);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clearCartOnLogout();
    window.location.href = "/auth/login";
  };

  return (
    <aside
      className={cn(
        "bg-brand-navy text-white h-screen max-h-dvh flex flex-col shrink-0 w-60 z-50",
        "fixed md:sticky md:top-0 md:self-start inset-y-0 left-0",
        "transform transition-transform duration-300 ease-in-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5 min-w-0" onClick={onClose}>
          <DentiumLogo size="sm" variant="wordmark" />
          <span className="text-[10px] text-brand-accent/80 uppercase tracking-wider font-medium">CMS</span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="md:hidden p-1 text-white/60 hover:text-white shrink-0"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 min-h-0 overflow-hidden flex flex-col px-2 py-2">
        <div className="space-y-0.5 shrink-0">
          {topLinks.map((item) => {
            const active = isItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors",
                  active
                    ? "bg-brand-accent text-brand-navy font-medium"
                    : "text-white/65 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{t(item.label)}</span>
              </Link>
            );
          })}
        </div>

        <div className="my-2 border-t border-white/10 shrink-0" />

        <div className="flex-1 min-h-0 flex flex-col gap-0.5 overflow-hidden">
          {menuSections.map((section) => {
            const isOpen = openSection === section.id;
            const sectionActive = section.items.some((item) => isItemActive(pathname, item.href));
            const badge = sectionBadgeCount(section, badges);

            return (
              <div key={section.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors",
                    sectionActive && !isOpen
                      ? "text-brand-accent bg-white/5"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                  aria-expanded={isOpen}
                >
                  <section.icon className="w-4 h-4 shrink-0 opacity-80" />
                  <span className="flex-1 text-left font-medium truncate">{t(section.title)}</span>
                  {badge > 0 && <NavBadge count={badge} subtle />}
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 shrink-0 text-white/40 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="mt-0.5 mb-1 ml-2 pl-2 border-l border-white/10 space-y-0.5">
                    {section.items.map((item) => {
                      const active = isItemActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors",
                            active
                              ? "bg-brand-accent text-brand-navy font-medium"
                              : "text-white/55 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <item.icon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          <span className="truncate flex-1">{t(item.label)}</span>
                          {item.badgeKey && <NavBadge count={badges[item.badgeKey]} />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="px-3 py-3 border-t border-white/10 shrink-0 space-y-1">
        <LanguageToggle dark className="mb-2" />
        <Link
          href="/"
          onClick={onClose}
          className="block px-2.5 py-1.5 text-white/45 text-xs hover:text-white transition-colors rounded-md hover:bg-white/5"
        >
          ← {t("View Website")}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-2.5 py-2 text-xs text-white/60 hover:text-white w-full rounded-md hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          {t("Logout")}
        </button>
      </div>
    </aside>
  );
}
