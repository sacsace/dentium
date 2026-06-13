"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminDetailPanel, AdminPageHeader, AdminPanelBreadcrumb } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { AdminInlineForm, FormField, inputClass } from "@/components/admin/AdminForm";
import { ActiveBadge, DetailField } from "@/components/admin/AdminDetailFields";
import { AdminListDetailGrid } from "@/components/admin/AdminListDetailGrid";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FeaturedImageField } from "@/components/admin/ImageUploadField";
import { useAdminListPanel } from "@/hooks/useAdminListPanel";
import { ADMIN_PANEL_CLASS, buildAdminBreadcrumbItems } from "@/lib/admin-panel";

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

function BannerDetailView({ item }: { item: Banner }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailField label="Title">{item.title}</DetailField>
        <DetailField label="Subtitle">{item.subtitle || "—"}</DetailField>
        <DetailField label="Sort Order">{item.sortOrder}</DetailField>
        <DetailField label="Status">
          <ActiveBadge active={item.isActive} />
        </DetailField>
        <DetailField label="CTA Text">{item.ctaText || "—"}</DetailField>
        <DetailField label="CTA Link">
          {item.ctaLink ? (
            <span className="break-all text-sm">{item.ctaLink}</span>
          ) : (
            "—"
          )}
        </DetailField>
      </div>
      {item.description && (
        <DetailField label="Description">
          <span className="whitespace-pre-wrap">{item.description}</span>
        </DetailField>
      )}
      {item.image && (
        <DetailField label="Banner Image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt={item.title} className="mt-2 max-h-48 rounded-sm border border-gray-200 object-cover" />
        </DetailField>
      )}
    </div>
  );
}

function BannerFormFields({
  form,
  setForm,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
}) {
  return (
    <>
      <FormField label="Title">
        <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </FormField>
      <FormField label="Subtitle">
        <input className={inputClass} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
      </FormField>
      <FormField label="Description">
        <textarea className={inputClass} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </FormField>
      <FormField label="Banner Image">
        <FeaturedImageField
          value={form.image}
          onChange={(image) => setForm({ ...form, image })}
          hint="Shown on homepage hero carousel"
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="CTA Text">
          <input className={inputClass} value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} />
        </FormField>
        <FormField label="CTA Link">
          <input className={inputClass} value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Sort Order">
          <input type="number" className={inputClass} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) })} />
        </FormField>
        <label className="flex items-center gap-2 text-sm pt-6">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active
        </label>
      </div>
    </>
  );
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { confirm, showAlert } = useConfirmDialog();
  const panel = useAdminListPanel<Banner>();

  const fetchData = async () => {
    const res = await fetch("/api/admin/banners");
    if (res.ok) setBanners(await res.json());
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
    setForm(bannerToForm(panel.selected));
    panel.openEdit();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image.trim()) {
      await showAlert({ variant: "warning", message: "Please upload or paste a banner image" });
      return;
    }
    setLoading(true);
    const editing = panel.panelMode === "edit" ? panel.selected : null;
    const url = editing ? `/api/admin/banners/${editing.id}` : "/api/admin/banners";
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      await showAlert({ variant: "error", message: data.error || "Failed to save banner" });
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

  const handleDelete = async (banner: Banner) => {
    const ok = await confirm({
      title: "Delete banner",
      message: `"${banner.title}" will be permanently deleted. This action cannot be undone.`,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/banners/${banner.id}`, { method: "DELETE" });
    if (res.ok) {
      if (panel.selected?.id === banner.id) panel.closePanel();
      fetchData();
    } else {
      const data = await res.json().catch(() => ({}));
      await showAlert({ variant: "error", message: data.error || "Failed to delete banner" });
    }
  };

  const itemLabel = panel.selected?.title ?? "Details";
  const breadcrumbItems = buildAdminBreadcrumbItems(
    "Main Banners",
    panel.panelMode,
    panel.panelMode !== "create" ? itemLabel : undefined,
    "Add Banner"
  );

  return (
    <div>
      <AdminPageHeader
        title="Main Banners"
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Banner
          </Button>
        }
      />

      <AdminListDetailGrid
        showSidePanel={panel.showSidePanel}
        list={
          <DataTable
            columns={[
              { key: "title", label: "Title" },
              { key: "subtitle", label: "Subtitle" },
              { key: "isActive", label: "Active", render: (b) => (b.isActive ? "Yes" : "No") },
              { key: "sortOrder", label: "Order" },
            ]}
            data={banners}
            onEdit={panel.openView}
            onDelete={handleDelete}
            selectedRowId={panel.activeRowId}
          />
        }
        panel={
          <>
            {panel.panelMode === "view" && panel.selected && (
              <AdminDetailPanel
                title={panel.selected.title}
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
                <BannerDetailView item={panel.selected} />
              </AdminDetailPanel>
            )}

            {panel.panelMode === "edit" && panel.selected && (
              <AdminInlineForm
                title="Edit Banner"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                cancelLabel="Back to details"
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                className={ADMIN_PANEL_CLASS}
              >
                <BannerFormFields form={form} setForm={setForm} />
              </AdminInlineForm>
            )}

            {panel.panelMode === "create" && (
              <AdminInlineForm
                title="Add Banner"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                className={ADMIN_PANEL_CLASS}
              >
                <BannerFormFields form={form} setForm={setForm} />
              </AdminInlineForm>
            )}
          </>
        }
      />

    </div>
  );
}
