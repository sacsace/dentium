"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminDialogProvider } from "@/components/admin/ConfirmDialog";
import { DentiumLogo } from "@/components/brand/DentiumLogo";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <AdminDialogProvider>
      <div className="flex h-screen max-h-dvh overflow-hidden bg-brand-gray">
        <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-brand-navy border-b border-white/10 flex items-center gap-3 px-4">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 text-white/80 hover:text-white rounded-sm"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <DentiumLogo href="/admin" size="sm" variant="wordmark" className="opacity-95" />
        <span className="text-[10px] text-brand-accent/90 uppercase tracking-wider ml-auto">Admin</span>
        </header>

        {mobileOpen && (
          <button
            type="button"
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <main className="flex-1 min-w-0 flex flex-col pt-14 md:pt-0">
          <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-h-0 overflow-auto">{children}</div>
        </main>
      </div>
    </AdminDialogProvider>
  );
}
