"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/admin/DataTable";
import { AdminForm, FormField, inputClass } from "@/components/admin/AdminForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";

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

const emptyForm = {
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

export default function AdminOfficesPage() {
  const [offices, setOffices] = useState<GlobalOffice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GlobalOffice | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { confirm, ConfirmDialogHost } = useConfirmDialog();

  const fetchData = async () => {
    const res = await fetch("/api/admin/offices");
    if (!res.ok) return;
    setOffices(await res.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => setForm(emptyForm);

  const openCreate = () => {
    resetForm();
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (office: GlobalOffice) => {
    setEditing(office);
    setForm({
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
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
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

      setShowForm(false);
      setEditing(null);
      resetForm();
      fetchData();
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
    fetchData();
  };

  return (
    <div>
      <AdminPageHeader
        title="Global Offices"
        description="Register, edit, and delete global network offices."
        action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Office</Button>}
      />

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
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <AdminForm
          title={editing ? "Edit Office" : "Add Office"}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
            resetForm();
          }}
          loading={loading}
        >
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
          {editing && (
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
        </AdminForm>
      )}
      <ConfirmDialogHost />
    </div>
  );
}
