"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/admin/DataTable";
import { AdminForm, FormField, inputClass } from "@/components/admin/AdminForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FeaturedImageField } from "@/components/admin/ImageUploadField";

interface GalleryItem {
  id: string;
  title: string | null;
  caption: string | null;
  imageUrl: string;
  category: string | null;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY_FORM = {
  title: "",
  caption: "",
  imageUrl: "",
  category: "",
  isActive: true,
  sortOrder: 0,
};

function itemToForm(item: GalleryItem) {
  return {
    title: item.title ?? "",
    caption: item.caption ?? "",
    imageUrl: item.imageUrl ?? "",
    category: item.category ?? "",
    isActive: item.isActive ?? true,
    sortOrder: item.sortOrder ?? 0,
  };
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { confirm, ConfirmDialogHost } = useConfirmDialog();

  const fetchData = async () => {
    const res = await fetch("/api/admin/gallery");
    if (res.ok) setItems(await res.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditing(item);
    setForm(itemToForm(item));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl.trim()) {
      alert("Please upload or paste an image URL");
      return;
    }

    setLoading(true);
    const url = editing ? `/api/admin/gallery/${editing.id}` : "/api/admin/gallery";
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);

    if (res.ok) {
      setShowForm(false);
      setEditing(null);
      fetchData();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to save gallery image");
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    const ok = await confirm({
      title: "Delete photo",
      message: `"${item.title || "This photo"}" will be permanently deleted. This action cannot be undone.`,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/gallery/${item.id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  return (
    <div>
      <ConfirmDialogHost />
      <AdminPageHeader
        title="Gallery"
        description="Manage event and seminar photos shown on the public gallery page"
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Photo
          </Button>
        }
      />

      <DataTable
        columns={[
          {
            key: "imageUrl",
            label: "Preview",
            render: (item) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt={item.title || "Gallery"} className="w-16 h-12 object-cover rounded-sm" />
            ),
          },
          { key: "title", label: "Title", render: (item) => item.title || "—" },
          { key: "category", label: "Category", render: (item) => item.category || "—" },
          {
            key: "isActive",
            label: "Status",
            render: (item) => (
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                  item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.isActive ? "Active" : "Hidden"}
              </span>
            ),
          },
          { key: "sortOrder", label: "Order" },
        ]}
        data={items}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <AdminForm
          title={editing ? "Edit Photo" : "Add Photo"}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          loading={loading}
        >
          <FormField label="Image *">
            <FeaturedImageField
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
            />
          </FormField>
          <FormField label="Title">
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Smile SAGA 2024"
            />
          </FormField>
          <FormField label="Caption">
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              placeholder="Optional description shown in lightbox"
            />
          </FormField>
          <FormField label="Category">
            <input
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Events, Seminars, Clinical..."
            />
          </FormField>
          <FormField label="Sort order">
            <input
              type="number"
              className={inputClass}
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </FormField>
          <label className="flex items-center gap-2 text-sm text-brand-dark">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Visible on website
          </label>
        </AdminForm>
      )}
    </div>
  );
}
