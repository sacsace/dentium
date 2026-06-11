import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Admin",
  path: "/admin",
  noIndex: true,
});

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  if (!session) redirect("/auth/login");

  return (
    <div className="flex min-h-screen bg-brand-gray">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-hidden flex flex-col">
        <div className="p-8 flex-1 flex flex-col min-h-0 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
