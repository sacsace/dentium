"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DentiumLogo } from "@/components/brand/DentiumLogo";

const menuItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Blog / News", href: "/admin/posts", icon: FileText },
  { label: "Downloads", href: "/admin/downloads", icon: Download },
  { label: "Gallery", href: "/admin/gallery", icon: Images },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Banners", href: "/admin/banners", icon: Image },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Quote Requests", href: "/admin/quotes", icon: ShoppingCart },
  { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { label: "Resumes", href: "/admin/resumes", icon: Briefcase },
  { label: "Global Offices", href: "/admin/offices", icon: Globe },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

type AdminSidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

export function AdminSidebar({ mobileOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
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
              <span className="truncate">{item.label}</span>
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
