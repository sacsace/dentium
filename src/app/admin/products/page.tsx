"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/admin/DataTable";
import { AdminForm, FormField, inputClass } from "@/components/admin/AdminForm";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  isActive: boolean;
  isFeatured: boolean;
  category: { name: string };
}

interface Category {
  id: string;
  name: string;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  shortDesc: "",
  brand: "Dentium",
  categoryId: "",
  price: "",
  showPrice: false,
  isFeatured: false,
  isNew: false,
  isActive: true,
  imageUrls: [] as string[],
  features: "",
  tags: "",
  seoTitle: "",
  seoDescription: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { confirm, ConfirmDialogHost } = useConfirmDialog();

  const fetchData = async () => {
    const [pRes, cRes] = await Promise.all([
      fetch("/api/admin/products"),
      fetch("/api/admin/categories"),
    ]);
    setProducts(await pRes.json());
    setCategories(await cRes.json());
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id || "" });
    setShowForm(true);
  };

  const openEdit = async (product: Product) => {
    setEditing(product);
    setFormLoading(true);
    setShowForm(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`);
      const data = await res.json();
      if (res.ok) {
        setForm({
          name: data.name ?? "",
          description: data.description ?? "",
          shortDesc: data.shortDesc ?? "",
          brand: data.brand ?? "Dentium",
          categoryId: data.categoryId ?? "",
          price: data.price != null ? String(data.price) : "",
          showPrice: data.showPrice ?? false,
          isFeatured: data.isFeatured ?? false,
          isNew: data.isNew ?? false,
          isActive: data.isActive ?? true,
          imageUrls: Array.isArray(data.images) ? data.images : [],
          features: Array.isArray(data.features) ? data.features.join("\n") : "",
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
          seoTitle: data.seoTitle ?? "",
          seoDescription: data.seoDescription ?? "",
        });
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { imageUrls, features, tags, ...rest } = form;
    const payload = {
      ...rest,
      images: imageUrls,
      features: features.split("\n").filter(Boolean),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      setShowForm(false);
      fetchData();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to save product");
    }
  };

  const handleDelete = async (product: Product) => {
    const ok = await confirm({
      title: "Delete product",
      message: `"${product.name}" will be permanently deleted. This action cannot be undone.`,
    });
    if (!ok) return;
    await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-brand-navy">Products</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Product</Button>
      </div>

      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "brand", label: "Brand" },
          { key: "category", label: "Category", render: (p) => p.category?.name },
          { key: "isActive", label: "Active", render: (p) => p.isActive ? "Yes" : "No" },
          { key: "isFeatured", label: "Featured", render: (p) => p.isFeatured ? "Yes" : "No" },
        ]}
        data={products}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <AdminForm title={editing ? "Edit Product" : "Add Product"} onSubmit={handleSubmit} onClose={() => setShowForm(false)} loading={loading}>
          <FormField label="Name"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
          <FormField label="Short Description"><input className={inputClass} value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} /></FormField>
          <FormField label="Description"><textarea className={inputClass} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
          <FormField label="Category">
            <select className={inputClass} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Price"><input type="number" className={inputClass} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></FormField>
            <FormField label="Brand"><input className={inputClass} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></FormField>
          </div>
          <FormField label="Product Images">
            {formLoading ? (
              <div className="h-24 border border-gray-200 rounded-sm bg-brand-gray/30 animate-pulse" />
            ) : (
              <ImageUploadField
                value={form.imageUrls}
                onChange={(imageUrls) => setForm((prev) => ({ ...prev, imageUrls }))}
              />
            )}
          </FormField>
          <FormField label="Features (one per line)"><textarea className={inputClass} rows={2} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} /></FormField>
          <FormField label="Tags (comma separated)"><input className={inputClass} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></FormField>
          <div className="flex flex-wrap gap-4">
            {["showPrice", "isFeatured", "isNew", "isActive"].map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form[key as keyof typeof form] as boolean} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
                {key.replace(/([A-Z])/g, " $1").trim()}
              </label>
            ))}
          </div>
          <FormField label="SEO Title"><input className={inputClass} value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} /></FormField>
          <FormField label="SEO Description"><textarea className={inputClass} rows={2} value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} /></FormField>
        </AdminForm>
      )}
      <ConfirmDialogHost />
    </div>
  );
}
