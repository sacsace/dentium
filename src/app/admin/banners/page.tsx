"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { AdminForm, FormField, inputClass } from "@/components/admin/AdminForm";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FeaturedImageField } from "@/components/admin/ImageUploadField";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string;
  ctaText: string | null;
  ctaLink: string | null;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY_FORM = {
  title: "", subtitle: "", description: "", image: "", ctaText: "", ctaLink: "", isActive: true, sortOrder: 0,
};

function bannerToForm(b: Banner) {
  return {
    title: b.title ?? "",
    subtitle: b.subtitle ?? "",
    description: b.description ?? "",
    image: b.image ?? "",
    ctaText: b.ctaText ?? "",
    ctaLink: b.ctaLink ?? "",
    isActive: b.isActive ?? true,
    sortOrder: b.sortOrder ?? 0,
  };
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { confirm, ConfirmDialogHost } = useConfirmDialog();

  const fetchData = async () => {
    const res = await fetch("/api/admin/banners");
    if (res.ok) setBanners(await res.json());
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (banner: Banner) => {
    setEditing(banner);
    setForm(bannerToForm(banner));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image.trim()) {
      alert("Please upload or paste a banner image");
      return;
    }
    setLoading(true);
    const url = editing ? `/api/admin/banners/${editing.id}` : "/api/admin/banners";
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    if (res.ok) {
      setShowForm(false);
      setEditing(null);
      fetchData();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to save banner");
    }
  };

  const handleDelete = async (banner: Banner) => {
    const ok = await confirm({
      title: "Delete banner",
      message: `"${banner.title}" will be permanently deleted. This action cannot be undone.`,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/banners/${banner.id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  return (
    <div>
      <AdminPageHeader
        title="Main Banners"
        action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Banner</Button>}
      />

      <DataTable
        columns={[
          { key: "title", label: "Title" },
          { key: "subtitle", label: "Subtitle" },
          { key: "isActive", label: "Active", render: (b) => b.isActive ? "Yes" : "No" },
          { key: "sortOrder", label: "Order" },
        ]}
        data={banners}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <AdminForm title={editing ? "Edit Banner" : "Add Banner"} onSubmit={handleSubmit} onClose={() => setShowForm(false)} loading={loading}>
          <FormField label="Title"><input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Subtitle"><input className={inputClass} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></FormField>
          <FormField label="Description"><textarea className={inputClass} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
          <FormField label="Banner Image">
            <FeaturedImageField
              value={form.image}
              onChange={(image) => setForm({ ...form, image })}
              hint="Shown on homepage hero carousel"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="CTA Text"><input className={inputClass} value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} /></FormField>
            <FormField label="CTA Link"><input className={inputClass} value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Sort Order"><input type="number" className={inputClass} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) })} /></FormField>
            <label className="flex items-center gap-2 text-sm pt-6"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
          </div>
        </AdminForm>
      )}
      <ConfirmDialogHost />
    </div>
  );
}
