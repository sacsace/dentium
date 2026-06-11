"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/admin/DataTable";
import { AdminInlineForm, FormField, inputClass } from "@/components/admin/AdminForm";
import { AdminDetailPanel, AdminPageHeader, AdminPanelBreadcrumb } from "@/components/admin/AdminPageHeader";
import { ActiveBadge, DetailField } from "@/components/admin/AdminDetailFields";
import { AdminListDetailGrid } from "@/components/admin/AdminListDetailGrid";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FeaturedImageField } from "@/components/admin/ImageUploadField";
import { useAdminListPanel } from "@/hooks/useAdminListPanel";
import { ADMIN_PANEL_CLASS, buildAdminBreadcrumbItems } from "@/lib/admin-panel";

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

function GalleryDetailView({ item }: { item: GalleryItem }) {
  return (
    <div className="space-y-6">
      <DetailField label="Preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageUrl} alt={item.title || "Gallery"} className="mt-2 max-h-48 rounded-sm border border-gray-200 object-cover" />
      </DetailField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailField label="Title">{item.title || "—"}</DetailField>
        <DetailField label="Category">{item.category || "—"}</DetailField>
        <DetailField label="Sort Order">{item.sortOrder}</DetailField>
        <DetailField label="Status">
          <ActiveBadge active={item.isActive} activeLabel="Active" inactiveLabel="Hidden" />
        </DetailField>
      </div>
      {item.caption && (
        <DetailField label="Caption">
          <span className="whitespace-pre-wrap">{item.caption}</span>
        </DetailField>
      )}
    </div>
  );
}

function GalleryFormFields({
  form,
  setForm,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
}) {
  return (
    <>
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
    </>
  );
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { confirm, ConfirmDialogHost } = useConfirmDialog();
  const panel = useAdminListPanel<GalleryItem>();

  const fetchData = async () => {
    const res = await fetch("/api/admin/gallery");
    if (res.ok) setItems(await res.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    panel.openCreate();
  };

  const openEditFromDetail = () => {
    if (!panel.selected) return;
    setForm(itemToForm(panel.selected));
    panel.openEdit();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl.trim()) {
      alert("Please upload or paste an image URL");
      return;
    }

    setLoading(true);
    const editing = panel.panelMode === "edit" ? panel.selected : null;
    const url = editing ? `/api/admin/gallery/${editing.id}` : "/api/admin/gallery";
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to save gallery image");
      return;
    }

    const saved = await res.json();
    await fetchData();

    if (panel.panelMode === "edit") {
      panel.setSelected(saved);
      panel.backToView();
      return;
    }

    panel.closePanel();
  };

  const handleDelete = async (item: GalleryItem) => {
    const ok = await confirm({
      title: "Delete photo",
      message: `"${item.title || "This photo"}" will be permanently deleted. This action cannot be undone.`,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/gallery/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      if (panel.selected?.id === item.id) panel.closePanel();
      fetchData();
    }
  };

  const itemLabel = panel.selected?.title || panel.selected?.category || "Photo";
  const breadcrumbItems = buildAdminBreadcrumbItems(
    "Gallery",
    panel.panelMode,
    panel.panelMode !== "create" ? itemLabel : undefined,
    "Add Photo"
  );

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

      <AdminListDetailGrid
        showSidePanel={panel.showSidePanel}
        list={
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
                  <ActiveBadge active={item.isActive} activeLabel="Active" inactiveLabel="Hidden" />
                ),
              },
              { key: "sortOrder", label: "Order" },
            ]}
            data={items}
            onEdit={panel.openView}
            onDelete={handleDelete}
            selectedRowId={panel.activeRowId}
          />
        }
        panel={
          <>
            {panel.panelMode === "view" && panel.selected && (
              <AdminDetailPanel
                title={panel.selected.title || "Photo"}
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                headerAction={
                  <Button type="button" size="sm" variant="secondary" onClick={openEditFromDetail}>
                    Edit
                  </Button>
                }
                onClose={panel.closePanel}
                className={ADMIN_PANEL_CLASS}
              >
                <GalleryDetailView item={panel.selected} />
              </AdminDetailPanel>
            )}

            {panel.panelMode === "edit" && panel.selected && (
              <AdminInlineForm
                title="Edit Photo"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                cancelLabel="Back to details"
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                className={ADMIN_PANEL_CLASS}
              >
                <GalleryFormFields form={form} setForm={setForm} />
              </AdminInlineForm>
            )}

            {panel.panelMode === "create" && (
              <AdminInlineForm
                title="Add Photo"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                className={ADMIN_PANEL_CLASS}
              >
                <GalleryFormFields form={form} setForm={setForm} />
              </AdminInlineForm>
            )}
          </>
        }
      />
    </div>
  );
}
