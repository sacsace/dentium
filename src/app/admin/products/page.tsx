"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BulkImportModal } from "@/components/admin/BulkImportModal";
import { PRODUCT_IMPORT_TEMPLATE } from "@/lib/bulk-product-import";
import { AdminDetailPanel, AdminPageHeader, AdminPanelBreadcrumb } from "@/components/admin/AdminPageHeader";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/admin/DataTable";
import { AdminInlineForm, FormField, inputClass } from "@/components/admin/AdminForm";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { useAdminListPanel } from "@/hooks/useAdminListPanel";
import { ADMIN_PANEL_CLASS, buildAdminBreadcrumbItems } from "@/lib/admin-panel";
import { refreshAdminNavBadges } from "@/lib/admin-nav-badges";

const RichTextEditor = dynamic(
  () => import("@/components/admin/RichTextEditor").then((m) => m.RichTextEditor),
  { ssr: false, loading: () => <div className="h-[320px] border border-gray-200 rounded-sm bg-brand-gray/30 animate-pulse" /> }
);

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  isActive: boolean;
  isFeatured: boolean;
  category: { name: string };
}

interface ProductDetail extends Product {
  description: string;
  shortDesc: string | null;
  sku: string | null;
  price: unknown;
  showPrice: boolean;
  isNew: boolean;
  tags: string[];
  images: string[];
  features: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

type FormState = typeof EMPTY_FORM;

const EMPTY_FORM = {
  name: "",
  sku: "",
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

function detailToForm(data: ProductDetail): FormState {
  return {
    name: data.name ?? "",
    sku: data.sku ?? "",
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
  };
}

function ProductFormFields({
  form,
  setForm,
  categories,
  formLoading,
  editorKey,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  categories: Category[];
  formLoading: boolean;
  editorKey: number;
}) {
  return (
    <>
      <FormField label="Name">
        <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </FormField>
      <FormField label="SKU">
        <input
          className={inputClass}
          value={form.sku}
          onChange={(e) => setForm({ ...form, sku: e.target.value })}
          placeholder="Product code (e.g. SL-DA-001)"
        />
      </FormField>
      <FormField label="Short Description">
        <input className={inputClass} value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} />
      </FormField>
      <FormField label="Description">
        {formLoading ? (
          <div className="h-[320px] border border-gray-200 rounded-sm bg-brand-gray/30 animate-pulse" />
        ) : (
          <RichTextEditor
            key={editorKey}
            value={form.description}
            onChange={(description) => setForm((prev) => ({ ...prev, description }))}
            placeholder="Write product description..."
          />
        )}
      </FormField>
      <FormField label="Category">
        <select className={inputClass} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Price">
          <input type="number" className={inputClass} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </FormField>
        <FormField label="Brand">
          <input className={inputClass} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        </FormField>
      </div>
      <FormField label="Product Images">
        {formLoading ? (
          <div className="h-24 border border-gray-200 rounded-sm bg-brand-gray/30 animate-pulse" />
        ) : (
          <ImageUploadField value={form.imageUrls} onChange={(imageUrls) => setForm((prev) => ({ ...prev, imageUrls }))} />
        )}
      </FormField>
      <FormField label="Features (one per line)">
        <textarea className={inputClass} rows={2} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
      </FormField>
      <FormField label="Tags (comma separated)">
        <input className={inputClass} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
      </FormField>
      <div className="flex flex-wrap gap-4">
        {(["showPrice", "isFeatured", "isNew", "isActive"] as const).map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
            />
            {key.replace(/([A-Z])/g, " $1").trim()}
          </label>
        ))}
      </div>
      <FormField label="SEO Title">
        <input className={inputClass} value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
      </FormField>
      <FormField label="SEO Description">
        <textarea className={inputClass} rows={2} value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
      </FormField>
    </>
  );
}

function ProductDetailView({ selected }: { selected: ProductDetail }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-brand-silver">Brand</span>
          <p className="font-medium">{selected.brand || "—"}</p>
        </div>
        <div>
          <span className="text-brand-silver">Category</span>
          <p className="font-medium">{selected.category?.name || "—"}</p>
        </div>
        <div>
          <span className="text-brand-silver">Slug</span>
          <p className="font-medium break-all">{selected.slug}</p>
        </div>
        <div>
          <span className="text-brand-silver">SKU</span>
          <p className="font-medium">{selected.sku || "—"}</p>
        </div>
        <div>
          <span className="text-brand-silver">Price</span>
          <p className="font-medium">{selected.showPrice && selected.price != null ? `₹${selected.price}` : "Hidden"}</p>
        </div>
      </div>

      {selected.shortDesc && (
        <div>
          <h4 className="text-sm font-semibold text-brand-navy mb-1">Short Description</h4>
          <p className="text-sm text-brand-dark">{selected.shortDesc}</p>
        </div>
      )}

      {selected.description && (
        <div>
          <h4 className="text-sm font-semibold text-brand-navy mb-1">Description</h4>
          <div
            className="prose-content text-sm text-brand-dark bg-brand-gray/40 p-4 rounded-sm"
            dangerouslySetInnerHTML={{ __html: selected.description }}
          />
        </div>
      )}

      {selected.images?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-brand-navy mb-3">Images</h4>
          <div className="flex flex-wrap gap-3">
            {selected.images.map((url, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={`${url}-${index}`} src={url} alt={`${selected.name} ${index + 1}`} className="w-24 h-24 object-cover rounded-sm border border-gray-200" />
            ))}
          </div>
        </div>
      )}

      {selected.features?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-brand-navy mb-2">Features</h4>
          <ul className="list-disc list-inside text-sm text-brand-dark space-y-1">
            {selected.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      )}

      {selected.tags?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-brand-navy mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {selected.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-brand-gray text-brand-dark text-xs rounded-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {(selected.seoTitle || selected.seoDescription) && (
        <div className="border-t pt-4 space-y-2 text-sm">
          <h4 className="font-semibold text-brand-navy">SEO</h4>
          {selected.seoTitle && (
            <p>
              <span className="text-brand-silver">Title: </span>
              {selected.seoTitle}
            </p>
          )}
          {selected.seoDescription && (
            <p>
              <span className="text-brand-silver">Description: </span>
              {selected.seoDescription}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [bulkOpen, setBulkOpen] = useState(false);
  const { confirm, showAlert } = useConfirmDialog();
  const panel = useAdminListPanel<ProductDetail>();

  const fetchData = async () => {
    const [pRes, cRes] = await Promise.all([fetch("/api/admin/products"), fetch("/api/admin/categories")]);
    setProducts(await pRes.json());
    setCategories(await cRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const closePanel = () => {
    panel.closePanel();
    setDetailLoading(false);
    setFormError(null);
  };

  const loadProductDetail = async (product: Product) => {
    panel.setPanelMode("view");
    setFormError(null);
    setDetailLoading(true);
    panel.setSelected(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`);
      const data = await res.json();
      if (res.ok) panel.setSelected(data);
    } finally {
      setDetailLoading(false);
    }
  };

  const openCreate = () => {
    panel.openCreate();
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id || "" });
    setFormLoading(false);
    setFormError(null);
    setEditorKey((k) => k + 1);
  };

  const openEditFromDetail = () => {
    if (!panel.selected) return;
    panel.openEdit();
    setForm(detailToForm(panel.selected));
    setFormLoading(false);
    setFormError(null);
    setEditorKey((k) => k + 1);
  };

  const cancelForm = () => {
    if (panel.panelMode === "edit" && panel.selected) {
      setFormError(null);
      panel.backToView();
      return;
    }
    closePanel();
  };

  const handleBreadcrumbNavigate = (id: string) => {
    if (id === "view" && panel.panelMode === "edit") {
      setFormError(null);
    }
    panel.handleBreadcrumbNavigate(id);
  };

  const itemLabel = panel.selected?.name ?? "Details";
  const breadcrumbItems = buildAdminBreadcrumbItems(
    "Products",
    panel.panelMode,
    panel.panelMode !== "create" ? itemLabel : undefined,
    "Add Product"
  );
  const breadcrumb = (
    <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={handleBreadcrumbNavigate} />
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    const { imageUrls, features, tags, sku, ...rest } = form;
    const payload = {
      ...rest,
      sku: sku.trim() || null,
      images: imageUrls,
      features: features.split("\n").filter(Boolean),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    const editing = panel.panelMode === "edit" ? panel.selected : null;
    const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setFormError(data.error || "Failed to save product. Please try again.");
      return;
    }

    const saved = await res.json();
    await fetchData();

    if (panel.panelMode === "edit" && editing) {
      panel.backToView();
      setDetailLoading(true);
      try {
        const detailRes = await fetch(`/api/admin/products/${saved.id ?? editing.id}`);
        const data = await detailRes.json();
        if (detailRes.ok) panel.setSelected(data);
      } finally {
        setDetailLoading(false);
      }
      return;
    }

    closePanel();
  };

  const handleBulkDelete = async (items: Product[]) => {
    const ok = await confirm({
      title: "Delete products",
      message: `${items.length} product${items.length === 1 ? "" : "s"} will be permanently deleted. This action cannot be undone.`,
    });
    if (!ok) return;

    const results = await Promise.all(
      items.map(async (product) => {
        const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
        const data = await res.json().catch(() => ({}));
        return { product, ok: res.ok, error: data.error as string | undefined };
      })
    );

    const failed = results.filter((r) => !r.ok);
    const deletedIds = new Set(results.filter((r) => r.ok).map((r) => r.product.id));

    if (panel.selected && deletedIds.has(panel.selected.id)) closePanel();
    await fetchData();
    if (deletedIds.size > 0) refreshAdminNavBadges();

    if (failed.length > 0) {
      const lines = failed.map((r) => `• ${r.product.name}: ${r.error ?? "Delete failed"}`);
      await showAlert({
        variant: "error",
        title: "Could not delete selected product(s)",
        message:
          failed.length === items.length
            ? lines.join("\n")
            : `${items.length - failed.length} deleted, ${failed.length} failed:\n\n${lines.join("\n")}`,
      });
    }
  };

  const showSidePanel = panel.showSidePanel || detailLoading;
  const activeRowId = panel.activeRowId;

  return (
    <div>
      <AdminPageHeader
        title="Products"
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setBulkOpen(true)}>
              <Upload className="w-4 h-4" /> Bulk Import
            </Button>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </div>
        }
      />

      <div className={cn("grid gap-6", showSidePanel && "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]")}>
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "category", label: "Category", render: (p) => p.category?.name },
            { key: "isActive", label: "Active", render: (p) => (p.isActive ? "Yes" : "No") },
            { key: "isFeatured", label: "Featured", render: (p) => (p.isFeatured ? "Yes" : "No") },
          ]}
          data={products}
          searchPlaceholder="Search by name, category..."
          onRowClick={loadProductDetail}
          selectedRowId={activeRowId}
          selectable
          onBulkDelete={handleBulkDelete}
        />

        {showSidePanel && panel.panelMode === "view" && (
          <AdminDetailPanel
            title={panel.selected?.name ?? "Product details"}
            breadcrumb={breadcrumb}
            headerAction={
              panel.selected ? (
                <Button type="button" size="sm" variant="secondary" onClick={openEditFromDetail}>
                  Edit
                </Button>
              ) : undefined
            }
            subtitle={
              panel.selected ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {panel.selected.isActive && (
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Active</span>
                  )}
                  {panel.selected.isFeatured && (
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Featured</span>
                  )}
                  {panel.selected.isNew && (
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">New</span>
                  )}
                </div>
              ) : undefined
            }
            loading={detailLoading && !panel.selected}
            onClose={closePanel}
            className={ADMIN_PANEL_CLASS}
          >
            {panel.selected && <ProductDetailView selected={panel.selected} />}
          </AdminDetailPanel>
        )}

        {showSidePanel && panel.panelMode === "edit" && (
          <AdminInlineForm
            title="Edit Product"
            subtitle={panel.selected ? <p className="text-sm text-brand-silver mt-1">{panel.selected.name}</p> : undefined}
            breadcrumb={breadcrumb}
            cancelLabel="Back to details"
            onSubmit={handleSubmit}
            onCancel={cancelForm}
            loading={loading}
            error={formError}
            className={ADMIN_PANEL_CLASS}
          >
            <ProductFormFields form={form} setForm={setForm} categories={categories} formLoading={formLoading} editorKey={editorKey} />
          </AdminInlineForm>
        )}

        {showSidePanel && panel.panelMode === "create" && (
          <AdminInlineForm
            title="Add Product"
            breadcrumb={breadcrumb}
            cancelLabel="Cancel"
            onSubmit={handleSubmit}
            onCancel={cancelForm}
            loading={loading}
            error={formError}
            className={ADMIN_PANEL_CLASS}
          >
            <ProductFormFields form={form} setForm={setForm} categories={categories} formLoading={formLoading} editorKey={editorKey} />
          </AdminInlineForm>
        )}
      </div>

      <BulkImportModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Bulk Import Products"
        description="Upload or paste a CSV file to register multiple products at once. Categories must already exist."
        templateFilename="products-template.csv"
        templateContent={PRODUCT_IMPORT_TEMPLATE}
        columnsHelp="Required: name, category (name or slug). Optional: sku, description, shortDesc, brand, price, showPrice, isFeatured, isNew, isActive, tags (comma-separated), features (| separated), images (| separated URLs)."
        importEndpoint="/api/admin/products/bulk"
        onComplete={fetchData}
      />
    </div>
  );
}
