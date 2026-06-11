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

interface GlobalOffice {
  id: string;
  country: string;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  isHeadquarter: boolean;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY_FORM = {
  country: "",
  city: "",
  address: "",
  phone: "",
  email: "",
  latitude: "",
  longitude: "",
  isHeadquarter: false,
  sortOrder: "0",
  isActive: true,
};

function officeToForm(office: GlobalOffice) {
  return {
    country: office.country,
    city: office.city,
    address: office.address || "",
    phone: office.phone || "",
    email: office.email || "",
    latitude: office.latitude?.toString() || "",
    longitude: office.longitude?.toString() || "",
    isHeadquarter: office.isHeadquarter,
    sortOrder: office.sortOrder.toString(),
    isActive: office.isActive,
  };
}

function OfficeDetailView({ item }: { item: GlobalOffice }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailField label="City">{item.city}</DetailField>
        <DetailField label="Country">{item.country}</DetailField>
        <DetailField label="Phone">{item.phone || "—"}</DetailField>
        <DetailField label="Email">{item.email || "—"}</DetailField>
        <DetailField label="Headquarters">{item.isHeadquarter ? "Yes" : "No"}</DetailField>
        <DetailField label="Sort Order">{item.sortOrder}</DetailField>
        <DetailField label="Status">
          <ActiveBadge active={item.isActive} />
        </DetailField>
        {item.latitude != null && item.longitude != null && (
          <>
            <DetailField label="Latitude">{item.latitude}</DetailField>
            <DetailField label="Longitude">{item.longitude}</DetailField>
          </>
        )}
      </div>
      {item.address && (
        <DetailField label="Address">
          <span className="whitespace-pre-wrap">{item.address}</span>
        </DetailField>
      )}
    </div>
  );
}

function OfficeFormFields({
  form,
  setForm,
  isEdit,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  isEdit: boolean;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Country *">
          <input
            required
            className={inputClass}
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
        </FormField>
        <FormField label="City *">
          <input
            required
            className={inputClass}
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </FormField>
      </div>
      <FormField label="Address">
        <textarea
          className={inputClass}
          rows={2}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Phone">
          <input
            className={inputClass}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </FormField>
        <FormField label="Email">
          <input
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Latitude">
          <input
            type="number"
            step="any"
            className={inputClass}
            value={form.latitude}
            onChange={(e) => setForm({ ...form, latitude: e.target.value })}
          />
        </FormField>
        <FormField label="Longitude">
          <input
            type="number"
            step="any"
            className={inputClass}
            value={form.longitude}
            onChange={(e) => setForm({ ...form, longitude: e.target.value })}
          />
        </FormField>
      </div>
      <FormField label="Sort order">
        <input
          type="number"
          className={inputClass}
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
        />
      </FormField>
      <FormField label="Headquarters">
        <label className="inline-flex items-center gap-2 text-sm text-brand-dark">
          <input
            type="checkbox"
            checked={form.isHeadquarter}
            onChange={(e) => setForm({ ...form, isHeadquarter: e.target.checked })}
          />
          Mark as headquarters (only one HQ at a time)
        </label>
      </FormField>
      {isEdit && (
        <FormField label="Active">
          <label className="inline-flex items-center gap-2 text-sm text-brand-dark">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Show on website
          </label>
        </FormField>
      )}
    </>
  );
}

export default function AdminOfficesPage() {
  const [offices, setOffices] = useState<GlobalOffice[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { confirm, ConfirmDialogHost } = useConfirmDialog();
  const panel = useAdminListPanel<GlobalOffice>();

  const fetchData = async () => {
    const res = await fetch("/api/admin/offices");
    if (!res.ok) return;
    setOffices(await res.json());
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
    setForm(officeToForm(panel.selected));
    panel.openEdit();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const editing = panel.panelMode === "edit" ? panel.selected : null;
      const payload = {
        country: form.country,
        city: form.city,
        address: form.address,
        phone: form.phone,
        email: form.email,
        latitude: form.latitude,
        longitude: form.longitude,
        isHeadquarter: form.isHeadquarter,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      };

      const res = await fetch(editing ? `/api/admin/offices/${editing.id}` : "/api/admin/offices", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to save office");
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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (office: GlobalOffice) => {
    const ok = await confirm({
      title: "Delete office",
      message: `"${office.city}, ${office.country}" will be permanently deleted. This action cannot be undone.`,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/offices/${office.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to delete office");
      return;
    }
    if (panel.selected?.id === office.id) panel.closePanel();
    fetchData();
  };

  const itemLabel = panel.selected ? `${panel.selected.city}, ${panel.selected.country}` : "Details";
  const breadcrumbItems = buildAdminBreadcrumbItems(
    "Global Offices",
    panel.panelMode,
    panel.panelMode !== "create" ? itemLabel : undefined,
    "Add Office"
  );

  return (
    <div>
      <AdminPageHeader
        title="Global Offices"
        description="Register, edit, and delete global network offices."
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Office
          </Button>
        }
      />

      <AdminListDetailGrid
        showSidePanel={panel.showSidePanel}
        list={
          <DataTable
            columns={[
              { key: "city", label: "City" },
              { key: "country", label: "Country" },
              { key: "address", label: "Address", render: (o) => o.address || "—" },
              { key: "phone", label: "Phone", render: (o) => o.phone || "—" },
              { key: "email", label: "Email", render: (o) => o.email || "—" },
              { key: "isHeadquarter", label: "HQ", render: (o) => (o.isHeadquarter ? "Yes" : "No") },
              { key: "sortOrder", label: "Order" },
              { key: "isActive", label: "Active", render: (o) => (o.isActive ? "Yes" : "No") },
            ]}
            data={offices}
            onEdit={panel.openView}
            onDelete={handleDelete}
            selectedRowId={panel.activeRowId}
          />
        }
        panel={
          <>
            {panel.panelMode === "view" && panel.selected && (
              <AdminDetailPanel
                title={`${panel.selected.city}, ${panel.selected.country}`}
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
                <OfficeDetailView item={panel.selected} />
              </AdminDetailPanel>
            )}

            {panel.panelMode === "edit" && panel.selected && (
              <AdminInlineForm
                title="Edit Office"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                cancelLabel="Back to details"
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                className={ADMIN_PANEL_CLASS}
              >
                <OfficeFormFields form={form} setForm={setForm} isEdit />
              </AdminInlineForm>
            )}

            {panel.panelMode === "create" && (
              <AdminInlineForm
                title="Add Office"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                className={ADMIN_PANEL_CLASS}
              >
                <OfficeFormFields form={form} setForm={setForm} isEdit={false} />
              </AdminInlineForm>
            )}
          </>
        }
      />

      <ConfirmDialogHost />
    </div>
  );
}
