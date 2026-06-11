"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/admin/DataTable";
import { AdminForm, FormField, inputClass } from "@/components/admin/AdminForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";

interface User {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const roleOptions = [
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    company: "",
    phone: "",
    isActive: true,
  });
  const { confirm, ConfirmDialogHost } = useConfirmDialog();

  const fetchData = async () => {
    const res = await fetch("/api/admin/users");
    if (!res.ok) return;
    const data = await res.json();
    setUsers(data.users ?? data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      role: "USER",
      company: "",
      phone: "",
      isActive: true,
    });
  };

  const openCreate = () => {
    resetForm();
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role === "ADMIN" ? "ADMIN" : "USER",
      company: user.company || "",
      phone: user.phone || "",
      isActive: user.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/users/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            role: form.role,
            company: form.company,
            phone: form.phone,
            isActive: form.isActive,
            password: form.password || undefined,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          alert(data.error || "Failed to update user");
          return;
        }
      } else {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
            company: form.company,
            phone: form.phone,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          alert(data.error || "Failed to create user");
          return;
        }
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      fetchData();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (user.role === "SUPER_ADMIN") {
      alert("Super admin account cannot be deleted");
      return;
    }
    const ok = await confirm({
      title: "Delete user",
      message: `"${user.name}" will be permanently deleted. This action cannot be undone.`,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to delete user");
      return;
    }
    fetchData();
  };

  return (
    <div>
      <AdminPageHeader
        title="Users"
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add User
          </Button>
        }
      />

      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "company", label: "Company", render: (u) => u.company || "—" },
          {
            key: "role",
            label: "Role",
            render: (u) => (
              <span
                className={
                  u.role === "ADMIN"
                    ? "text-brand-deep font-medium"
                    : u.role === "SUPER_ADMIN"
                      ? "text-amber-700 font-medium"
                      : ""
                }
              >
                {u.role}
              </span>
            ),
          },
          { key: "isActive", label: "Active", render: (u) => (u.isActive ? "Yes" : "No") },
          { key: "createdAt", label: "Joined", render: (u) => new Date(u.createdAt).toLocaleDateString() },
        ]}
        data={users}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <AdminForm
          title={editing ? "Edit User" : "Add User"}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
            resetForm();
          }}
          loading={loading}
        >
          <FormField label="Name">
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </FormField>
          <FormField label="Email">
            <input
              required
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={!!editing}
            />
          </FormField>
          {!editing && (
            <FormField label="Password">
              <input
                required
                type="password"
                className={inputClass}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </FormField>
          )}
          {editing && (
            <FormField label="New Password (optional)">
              <input
                type="password"
                className={inputClass}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Leave blank to keep current password"
              />
            </FormField>
          )}
          <FormField label="Role">
            {editing?.role === "SUPER_ADMIN" ? (
              <input className={inputClass} value="SUPER_ADMIN" disabled />
            ) : (
              <select
                className={inputClass}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </FormField>
          <FormField label="Company">
            <input
              className={inputClass}
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </FormField>
          <FormField label="Phone">
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </FormField>
          {editing && (
            <FormField label="Active">
              <label className="inline-flex items-center gap-2 text-sm text-brand-dark">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Account is active
              </label>
            </FormField>
          )}
        </AdminForm>
      )}
      <ConfirmDialogHost />
    </div>
  );
}
