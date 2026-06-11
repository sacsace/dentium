"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/admin/DataTable";
import { AdminForm, FormField, inputClass } from "@/components/admin/AdminForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY_FORM = { name: "", description: "", image: "", isActive: true, sortOrder: 0 };

function categoryToForm(c: Category) {
  return {
    name: c.name ?? "",
    description: c.description ?? "",
    image: c.image ?? "",
    isActive: c.isActive ?? true,
    sortOrder: c.sortOrder ?? 0,
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { confirm, ConfirmDialogHost } = useConfirmDialog();

  const fetchData = async () => {
    const res = await fetch("/api/admin/categories");
    if (res.ok) setCategories(await res.json());
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm(categoryToForm(category));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories";
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      fetchData();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to save category");
    }
  };

  const handleDelete = async (category: Category) => {
    const ok = await confirm({
      title: "Delete category",
      message: `"${category.name}" will be permanently deleted. This action cannot be undone.`,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    if (res.ok) {
      fetchData();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to delete category");
    }
  };

  return (
    <div>
      <AdminPageHeader title="Categories" action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Category</Button>} />

      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "slug", label: "Slug" },
          { key: "isActive", label: "Active", render: (c) => c.isActive ? "Yes" : "No" },
        ]}
        data={categories}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <AdminForm title={editing ? "Edit Category" : "Add Category"} onSubmit={handleSubmit} onClose={() => setShowForm(false)} loading={loading}>
          <FormField label="Name"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
          <FormField label="Description"><textarea className={inputClass} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
          <FormField label="Image URL"><input className={inputClass} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Sort Order"><input type="number" className={inputClass} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} /></FormField>
            <label className="flex items-center gap-2 text-sm pt-6"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
          </div>
        </AdminForm>
      )}
      <ConfirmDialogHost />
    </div>
  );
}
