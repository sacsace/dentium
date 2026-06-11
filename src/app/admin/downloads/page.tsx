"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/admin/DataTable";
import { AdminForm, FormField, inputClass } from "@/components/admin/AdminForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DownloadFileField, type DownloadFileMeta } from "@/components/admin/DownloadFileField";
import { formatFileSize } from "@/lib/format-file-size";

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

export default function AdminDownloadsPage() {
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DownloadItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fileMeta, setFileMeta] = useState<DownloadFileMeta | null>(null);
  const { confirm, ConfirmDialogHost } = useConfirmDialog();

  const fetchData = async () => {
    const res = await fetch("/api/admin/downloads");
    if (res.ok) setItems(await res.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFileMeta(null);
    setShowForm(true);
  };

  const openEdit = (item: DownloadItem) => {
    setEditing(item);
    setForm(itemToForm(item));
    setFileMeta(itemToFileMeta(item));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileMeta) {
      alert("Please upload a file");
      return;
    }

    setLoading(true);
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

    if (res.ok) {
      setShowForm(false);
      setEditing(null);
      setFileMeta(null);
      fetchData();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to save download");
    }
  };

  const handleDelete = async (item: DownloadItem) => {
    const ok = await confirm({
      title: "Delete download",
      message: `"${item.title}" will be permanently deleted. This action cannot be undone.`,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/downloads/${item.id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  return (
    <div>
      <ConfirmDialogHost />
      <AdminPageHeader
        title="Downloads"
        description="Manage brochures, guides, and downloadable resources"
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Download
          </Button>
        }
      />

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
          title={editing ? "Edit Download" : "Add Download"}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          loading={loading}
        >
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
        </AdminForm>
      )}
    </div>
  );
}
