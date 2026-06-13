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
import { DownloadFileField, type DownloadFileMeta } from "@/components/admin/DownloadFileField";
import { formatFileSize } from "@/lib/format-file-size";
import { useAdminListPanel } from "@/hooks/useAdminListPanel";
import { ADMIN_PANEL_CLASS, buildAdminBreadcrumbItems } from "@/lib/admin-panel";

interface DownloadItem {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number | null;
  requiresLogin: boolean;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY_FORM = {
  title: "",
  description: "",
  requiresLogin: false,
  isActive: true,
  sortOrder: 0,
};

function itemToForm(item: DownloadItem) {
  return {
    title: item.title ?? "",
    description: item.description ?? "",
    requiresLogin: item.requiresLogin ?? false,
    isActive: item.isActive ?? true,
    sortOrder: item.sortOrder ?? 0,
  };
}

function itemToFileMeta(item: DownloadItem): DownloadFileMeta {
  return {
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileType: item.fileType,
    fileSizeBytes: item.fileSizeBytes ?? 0,
  };
}

function DownloadDetailView({ item }: { item: DownloadItem }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailField label="Title">{item.title}</DetailField>
        <DetailField label="File Type">{item.fileType}</DetailField>
        <DetailField label="File Name">{item.fileName}</DetailField>
        <DetailField label="File Size">{formatFileSize(item.fileSizeBytes)}</DetailField>
        <DetailField label="Access">{item.requiresLogin ? "Login required" : "Public"}</DetailField>
        <DetailField label="Sort Order">{item.sortOrder}</DetailField>
        <DetailField label="Status">
          <ActiveBadge active={item.isActive} activeLabel="Active" inactiveLabel="Hidden" />
        </DetailField>
      </div>
      {item.description && (
        <DetailField label="Description">
          <span className="whitespace-pre-wrap">{item.description}</span>
        </DetailField>
      )}
      {item.fileUrl && (
        <DetailField label="File URL">
          <span className="break-all text-sm">{item.fileUrl}</span>
        </DetailField>
      )}
    </div>
  );
}

function DownloadFormFields({
  form,
  setForm,
  fileMeta,
  setFileMeta,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  fileMeta: DownloadFileMeta | null;
  setFileMeta: React.Dispatch<React.SetStateAction<DownloadFileMeta | null>>;
}) {
  return (
    <>
      <FormField label="Title *">
        <input
          className={inputClass}
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </FormField>
      <FormField label="Description">
        <textarea
          className={`${inputClass} resize-none`}
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </FormField>
      <FormField label="File *">
        <DownloadFileField value={fileMeta} onChange={setFileMeta} />
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
          checked={form.requiresLogin}
          onChange={(e) => setForm({ ...form, requiresLogin: e.target.checked })}
        />
        Login required to download
      </label>
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

export default function AdminDownloadsPage() {
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fileMeta, setFileMeta] = useState<DownloadFileMeta | null>(null);
  const { confirm, showAlert } = useConfirmDialog();
  const panel = useAdminListPanel<DownloadItem>();

  const fetchData = async () => {
    const res = await fetch("/api/admin/downloads");
    if (res.ok) setItems(await res.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFileMeta(null);
    panel.openCreate();
  };

  const openEditFromDetail = () => {
    if (!panel.selected) return;
    setForm(itemToForm(panel.selected));
    setFileMeta(itemToFileMeta(panel.selected));
    panel.openEdit();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileMeta) {
      await showAlert({ variant: "warning", message: "Please upload a file" });
      return;
    }

    setLoading(true);
    const editing = panel.panelMode === "edit" ? panel.selected : null;
    const url = editing ? `/api/admin/downloads/${editing.id}` : "/api/admin/downloads";
    const payload = {
      ...form,
      fileUrl: fileMeta.fileUrl,
      fileName: fileMeta.fileName,
      fileType: fileMeta.fileType,
      fileSizeBytes: fileMeta.fileSizeBytes,
    };

    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      await showAlert({ variant: "error", message: data.error || "Failed to save download" });
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
    setFileMeta(null);
  };

  const handleDelete = async (item: DownloadItem) => {
    const ok = await confirm({
      title: "Delete download",
      message: `"${item.title}" will be permanently deleted. This action cannot be undone.`,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/downloads/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      if (panel.selected?.id === item.id) panel.closePanel();
      fetchData();
    }
  };

  const itemLabel = panel.selected?.title ?? "Details";
  const breadcrumbItems = buildAdminBreadcrumbItems(
    "Downloads",
    panel.panelMode,
    panel.panelMode !== "create" ? itemLabel : undefined,
    "Add Download"
  );

  return (
    <div>
      <AdminPageHeader
        title="Downloads"
        description="Manage brochures, guides, and downloadable resources"
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Download
          </Button>
        }
      />

      <AdminListDetailGrid
        showSidePanel={panel.showSidePanel}
        list={
          <DataTable
            columns={[
              { key: "title", label: "Title" },
              { key: "fileType", label: "Type" },
              {
                key: "fileSizeBytes",
                label: "Size",
                render: (item) => formatFileSize(item.fileSizeBytes),
              },
              {
                key: "requiresLogin",
                label: "Access",
                render: (item) => (item.requiresLogin ? "Login required" : "Public"),
              },
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
                <DownloadDetailView item={panel.selected} />
              </AdminDetailPanel>
            )}

            {panel.panelMode === "edit" && panel.selected && (
              <AdminInlineForm
                title="Edit Download"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                cancelLabel="Back to details"
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                className={ADMIN_PANEL_CLASS}
              >
                <DownloadFormFields form={form} setForm={setForm} fileMeta={fileMeta} setFileMeta={setFileMeta} />
              </AdminInlineForm>
            )}

            {panel.panelMode === "create" && (
              <AdminInlineForm
                title="Add Download"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                className={ADMIN_PANEL_CLASS}
              >
                <DownloadFormFields form={form} setForm={setForm} fileMeta={fileMeta} setFileMeta={setFileMeta} />
              </AdminInlineForm>
            )}
          </>
        }
      />
    </div>
  );
}
