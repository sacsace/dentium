"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
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

const RichTextEditor = dynamic(
  () => import("@/components/admin/RichTextEditor").then((module) => module.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] border border-gray-200 rounded-sm bg-brand-gray/30 animate-pulse" />
    ),
  }
);

type PopupContentType = "IMAGE" | "VIDEO" | "HTML";
type PopupDisplayTarget = "ALL" | "MOBILE" | "DESKTOP";

interface Popup {
  id: string;
  title: string;
  content: string | null;
  image: string | null;
  videoUrl: string | null;
  contentType: PopupContentType;
  displayTarget: PopupDisplayTarget;
  ctaText: string | null;
  ctaLink: string | null;
  isActive: boolean;
  sortOrder: number;
  startDate: string | null;
  endDate: string | null;
}

const EMPTY_FORM = {
  title: "",
  content: "",
  image: "",
  videoUrl: "",
  contentType: "IMAGE" as PopupContentType,
  displayTarget: "ALL" as PopupDisplayTarget,
  ctaText: "",
  ctaLink: "",
  isActive: false,
  sortOrder: 0,
  startDate: "",
  endDate: "",
};

function popupToForm(p: Popup) {
  return {
    title: p.title ?? "",
    content: p.content ?? "",
    image: p.image ?? "",
    videoUrl: p.videoUrl ?? "",
    contentType: p.contentType,
    displayTarget: p.displayTarget,
    ctaText: p.ctaText ?? "",
    ctaLink: p.ctaLink ?? "",
    isActive: p.isActive ?? false,
    sortOrder: p.sortOrder ?? 0,
    startDate: p.startDate ? p.startDate.slice(0, 10) : "",
    endDate: p.endDate ? p.endDate.slice(0, 10) : "",
  };
}

function PopupFormFields({
  form,
  setForm,
  editorKey,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  editorKey: number;
}) {
  return (
    <>
      <FormField label="Title">
        <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Content Type">
          <select className={inputClass} value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value as PopupContentType })}>
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Video (embed URL)</option>
            <option value="HTML">HTML</option>
          </select>
        </FormField>
        <FormField label="Display On">
          <select className={inputClass} value={form.displayTarget} onChange={(e) => setForm({ ...form, displayTarget: e.target.value as PopupDisplayTarget })}>
            <option value="ALL">All devices</option>
            <option value="MOBILE">Mobile only</option>
            <option value="DESKTOP">Desktop only</option>
          </select>
        </FormField>
      </div>
      {form.contentType === "IMAGE" && (
        <FormField label="Image">
          <FeaturedImageField value={form.image} onChange={(image) => setForm({ ...form, image })} />
        </FormField>
      )}
      {form.contentType === "VIDEO" && (
        <FormField label="Video Embed URL">
          <input className={inputClass} value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://www.youtube.com/embed/..." />
        </FormField>
      )}
      <FormField label="Description">
        <RichTextEditor
          key={editorKey}
          value={form.content}
          onChange={(content) => setForm((previous) => ({ ...previous, content }))}
          placeholder="Write the popup description and add images..."
        />
        <p className="mt-1.5 text-xs text-brand-silver">
          Use the image button in the toolbar to upload an image into the description.
        </p>
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="CTA Text"><input className={inputClass} value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} /></FormField>
        <FormField label="CTA Link"><input className={inputClass} value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} /></FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Start Date"><input type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></FormField>
        <FormField label="End Date"><input type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Sort Order"><input type="number" className={inputClass} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} /></FormField>
        <label className="flex items-center gap-2 text-sm pt-6"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
      </div>
    </>
  );
}

function PopupDetailView({ item }: { item: Popup }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <DetailField label="Type">{item.contentType}</DetailField>
        <DetailField label="Display">{item.displayTarget}</DetailField>
        <DetailField label="Status"><ActiveBadge active={item.isActive} /></DetailField>
        <DetailField label="Sort">{item.sortOrder}</DetailField>
        <DetailField label="Start">{item.startDate ? new Date(item.startDate).toLocaleDateString() : "—"}</DetailField>
        <DetailField label="End">{item.endDate ? new Date(item.endDate).toLocaleDateString() : "—"}</DetailField>
      </div>
      {item.content && (
        <DetailField label="Content">
          <div
            className="prose prose-sm max-w-none tiptap-content"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        </DetailField>
      )}
    </div>
  );
}

export default function AdminPopupsPage() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editorKey, setEditorKey] = useState(0);
  const { confirm, showAlert } = useConfirmDialog();
  const panel = useAdminListPanel<Popup>();

  const fetchData = async () => {
    const res = await fetch("/api/admin/popups");
    if (res.ok) setPopups(await res.json());
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditorKey((key) => key + 1);
    panel.openCreate();
  };
  const openEditFromDetail = () => {
    if (panel.selected) {
      setForm(popupToForm(panel.selected));
      setEditorKey((key) => key + 1);
      panel.openEdit();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const editing = panel.panelMode === "edit" ? panel.selected : null;
    const url = editing ? `/api/admin/popups/${editing.id}` : "/api/admin/popups";
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    if (res.ok) { await fetchData(); panel.closePanel(); }
    else { const data = await res.json().catch(() => ({})); await showAlert({ variant: "error", message: data.error || "Failed to save" }); }
  };

  const handleDelete = async (item: Popup) => {
    const ok = await confirm({ title: "Delete popup", message: `"${item.title}" will be permanently deleted.` });
    if (!ok) return;
    const res = await fetch(`/api/admin/popups/${item.id}`, { method: "DELETE" });
    if (res.ok) { if (panel.selected?.id === item.id) panel.closePanel(); fetchData(); }
  };

  const breadcrumbItems = buildAdminBreadcrumbItems("Popups", panel.panelMode, panel.panelMode !== "create" ? panel.selected?.title : undefined, "Add Popup");

  return (
    <div>
      <AdminPageHeader title="Popups" action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Popup</Button>} />
      <AdminListDetailGrid
        showSidePanel={panel.showSidePanel}
        list={
          <DataTable
            columns={[
              { key: "title", label: "Title" },
              { key: "contentType", label: "Type" },
              { key: "displayTarget", label: "Display" },
              { key: "isActive", label: "Active", render: (p) => <ActiveBadge active={p.isActive} /> },
            ]}
            data={popups}
            onEdit={panel.openView}
            onDelete={handleDelete}
            selectedRowId={panel.activeRowId}
          />
        }
        panel={
          <>
            {panel.panelMode === "view" && panel.selected && (
              <AdminDetailPanel title={panel.selected.title} breadcrumb={<AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />} headerAction={<Button type="button" size="sm" variant="secondary" onClick={openEditFromDetail}>Edit</Button>} onClose={panel.closePanel} className={ADMIN_PANEL_CLASS}>
                <PopupDetailView item={panel.selected} />
              </AdminDetailPanel>
            )}
            {panel.panelMode === "edit" && panel.selected && (
              <AdminInlineForm title="Edit Popup" breadcrumb={<AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />} cancelLabel="Back to details" onSubmit={handleSubmit} onCancel={panel.cancelForm} loading={loading} className={ADMIN_PANEL_CLASS}>
                <PopupFormFields form={form} setForm={setForm} editorKey={editorKey} />
              </AdminInlineForm>
            )}
            {panel.panelMode === "create" && (
              <AdminInlineForm title="Add Popup" breadcrumb={<AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />} onSubmit={handleSubmit} onCancel={panel.cancelForm} loading={loading} className={ADMIN_PANEL_CLASS}>
                <PopupFormFields form={form} setForm={setForm} editorKey={editorKey} />
              </AdminInlineForm>
            )}
          </>
        }
      />
    </div>
  );
}
