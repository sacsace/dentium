"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  Calendar,
  Image,
  ShoppingCart,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Globe,
  BarChart3,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DentiumLogo } from "@/components/brand/DentiumLogo";

const menuItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Blog / News", href: "/admin/posts", icon: FileText },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Banners", href: "/admin/banners", icon: Image },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Quote Requests", href: "/admin/quotes", icon: ShoppingCart },
  { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { label: "Resumes", href: "/admin/resumes", icon: Briefcase },
  { label: "Global Offices", href: "/admin/offices", icon: Globe },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth/login";
  };

  return (
    <aside className="w-64 bg-brand-navy text-white min-h-screen flex flex-col shrink-0">
      <div className="p-5 border-b border-white/10">
        <Link href="/admin" className="block space-y-3">
          <DentiumLogo size="sm" variant="wordmark" />
          <div>
            <span className="font-semibold text-sm text-white/90">Admin</span>
            <span className="block text-[10px] text-brand-accent/80 uppercase tracking-wider">CMS</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors",
                isActive
                  ? "bg-brand-accent text-brand-navy font-medium"
                  : "text-white/60 hover:text-white hover:bg-brand-accent/10"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link href="/" className="block text-white/50 text-xs mb-3 hover:text-white transition-colors">
          ← View Website
        </Link>
        <button
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
