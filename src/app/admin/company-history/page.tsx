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
import { useAdminListPanel } from "@/hooks/useAdminListPanel";
import { ADMIN_PANEL_CLASS, buildAdminBreadcrumbItems } from "@/lib/admin-panel";

interface HistoryItem {
  id: string;
  year: number;
  title: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY_FORM = {
  year: "",
  title: "",
  description: "",
  sortOrder: "0",
  isActive: true,
};

function itemToForm(item: HistoryItem) {
  return {
    year: String(item.year),
    title: item.title,
    description: item.description ?? "",
    sortOrder: String(item.sortOrder),
    isActive: item.isActive,
  };
}

function HistoryDetailView({ item }: { item: HistoryItem }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailField label="Year">{item.year}</DetailField>
        <DetailField label="Sort Order">{item.sortOrder}</DetailField>
        <DetailField label="Title" className="sm:col-span-2">
          {item.title}
        </DetailField>
        <DetailField label="Status">
          <ActiveBadge active={item.isActive} activeLabel="Visible" inactiveLabel="Hidden" />
        </DetailField>
      </div>
      {item.description && (
        <DetailField label="Description">
          <span className="whitespace-pre-wrap">{item.description}</span>
        </DetailField>
      )}
    </div>
  );
}

function HistoryFormFields({
  form,
  setForm,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Year">
          <input
            required
            type="number"
            min={1900}
            max={2100}
            className={inputClass}
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
          />
        </FormField>
        <FormField label="Sort Order">
          <input
            type="number"
            className={inputClass}
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
        </FormField>
      </div>
      <FormField label="Title">
        <input
          required
          className={inputClass}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Dentium Founded"
        />
      </FormField>
      <FormField label="Description">
        <textarea
          className={inputClass}
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Brief description of this milestone..."
        />
      </FormField>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
        />
        Active (visible on About page)
      </label>
    </>
  );
}

export default function AdminCompanyHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const { confirm, ConfirmDialogHost } = useConfirmDialog();
  const panel = useAdminListPanel<HistoryItem>();

  const fetchData = async () => {
    const res = await fetch("/api/admin/company-history");
    if (res.ok) setItems(await res.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    panel.openCreate();
  };

  const openEditFromDetail = () => {
    if (!panel.selected) return;
    setForm(itemToForm(panel.selected));
    setFormError(null);
    panel.openEdit();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    try {
      const editing = panel.panelMode === "edit" ? panel.selected : null;
      const url = editing ? `/api/admin/company-history/${editing.id}` : "/api/admin/company-history";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || "Failed to save history entry. Please try again.");
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
      setForm(EMPTY_FORM);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: HistoryItem) => {
    const ok = await confirm({
      title: "Delete history entry",
      message: `"${item.year} — ${item.title}" will be permanently deleted.`,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/company-history/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      if (panel.selected?.id === item.id) panel.closePanel();
      fetchData();
    }
  };

  const itemLabel = panel.selected ? `${panel.selected.year} — ${panel.selected.title}` : "Details";
  const breadcrumbItems = buildAdminBreadcrumbItems(
    "Company History",
    panel.panelMode,
    panel.panelMode !== "create" ? itemLabel : undefined,
    "Add Entry"
  );

  return (
    <div>
      <AdminPageHeader
        title="Company History"
        description="Manage the timeline shown on the Why Dentium (About) page."
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Entry
          </Button>
        }
      />

      <AdminListDetailGrid
        showSidePanel={panel.showSidePanel}
        list={
          <DataTable
            columns={[
              { key: "year", label: "Year", sortValue: (item) => item.year },
              { key: "title", label: "Title" },
              {
                key: "description",
                label: "Description",
                render: (item) => (
                  <span className="line-clamp-2 max-w-md">{item.description || "—"}</span>
                ),
              },
              { key: "sortOrder", label: "Order", sortValue: (item) => item.sortOrder },
              { key: "isActive", label: "Active", render: (item) => (item.isActive ? "Yes" : "No") },
            ]}
            data={items}
            searchPlaceholder="Search by year, title..."
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
                subtitle={String(panel.selected.year)}
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
                <HistoryDetailView item={panel.selected} />
              </AdminDetailPanel>
            )}

            {panel.panelMode === "edit" && panel.selected && (
              <AdminInlineForm
                title="Edit History Entry"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                cancelLabel="Back to details"
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                error={formError}
                className={ADMIN_PANEL_CLASS}
              >
                <HistoryFormFields form={form} setForm={setForm} />
              </AdminInlineForm>
            )}

            {panel.panelMode === "create" && (
              <AdminInlineForm
                title="Add History Entry"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                error={formError}
                className={ADMIN_PANEL_CLASS}
              >
                <HistoryFormFields form={form} setForm={setForm} />
              </AdminInlineForm>
            )}
          </>
        }
      />

      <ConfirmDialogHost />
    </div>
  );
}
