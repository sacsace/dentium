"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearCartOnLogout } from "@/components/cart/CartAuthSync";
import { DentiumLogo } from "@/components/brand/DentiumLogo";

type MenuItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badgeKey?: keyof NavBadges;
};

const menuItems: MenuItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Blog / News", href: "/admin/posts", icon: FileText },
  { label: "Downloads", href: "/admin/downloads", icon: Download },
  { label: "Gallery", href: "/admin/gallery", icon: Images },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Banners", href: "/admin/banners", icon: Image },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart, badgeKey: "orders" },
  { label: "Quote Requests", href: "/admin/quotes", icon: ShoppingCart },
  { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { label: "Resumes", href: "/admin/resumes", icon: Briefcase },
  { label: "Global Offices", href: "/admin/offices", icon: Globe },
  { label: "Company History", href: "/admin/company-history", icon: History },
  { label: "Team Members", href: "/admin/team-members", icon: UserCircle },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

type NavBadges = {
  orders: number;
};

function formatBadgeCount(count: number): string {
  if (count > 99) return "99+";
  return String(count);
}

function NavBadge({ count, active }: { count: number; active: boolean }) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "ml-auto shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold leading-none inline-flex items-center justify-center",
        active ? "bg-brand-navy text-brand-accent" : "bg-brand-accent text-brand-navy"
      )}
      aria-label={`${count} pending orders`}
    >
      {formatBadgeCount(count)}
    </span>
  );
}

type AdminSidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

export function AdminSidebar({ mobileOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [badges, setBadges] = useState<NavBadges>({ orders: 0 });

  const loadBadges = useCallback(() => {
    fetch("/api/admin/nav-badges")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.orders === "number") {
          setBadges({ orders: data.orders });
        }
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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clearCartOnLogout();
    window.location.href = "/auth/login";
  };

  return (
    <aside
      className={cn(
        "bg-brand-navy text-white min-h-screen flex flex-col shrink-0 w-64 z-50",
        "fixed lg:static inset-y-0 left-0",
        "transform transition-transform duration-300 ease-in-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="p-5 border-b border-white/10 flex items-start justify-between gap-3">
        <Link href="/admin" className="block space-y-3 min-w-0" onClick={onClose}>
          <DentiumLogo size="sm" variant="wordmark" />
          <div>
            <span className="font-semibold text-sm text-white/90">Admin</span>
            <span className="block text-[10px] text-brand-accent/80 uppercase tracking-wider">CMS</span>
          </div>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden p-1.5 text-white/60 hover:text-white shrink-0"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-3 sm:p-4 space-y-0.5 overflow-y-auto overscroll-contain">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-sm text-sm transition-colors",
                isActive
                  ? "bg-brand-accent text-brand-navy font-medium"
                  : "text-white/60 hover:text-white hover:bg-brand-accent/10"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="truncate flex-1 min-w-0">{item.label}</span>
              {item.badgeKey && <NavBadge count={badges[item.badgeKey]} active={isActive} />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          onClick={onClose}
          className="block text-white/50 text-xs mb-3 hover:text-white transition-colors"
        >
          ← View Website
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white w-full rounded-sm hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
