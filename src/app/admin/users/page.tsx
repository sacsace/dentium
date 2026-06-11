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

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "USER",
  company: "",
  phone: "",
  isActive: true,
};

const roleOptions = [
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" },
];

function userToForm(user: User) {
  return {
    name: user.name,
    email: user.email,
    password: "",
    role: user.role === "ADMIN" ? "ADMIN" : "USER",
    company: user.company || "",
    phone: user.phone || "",
    isActive: user.isActive,
  };
}

function UserDetailView({ item }: { item: User }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailField label="Name">{item.name}</DetailField>
        <DetailField label="Email">{item.email}</DetailField>
        <DetailField label="Company">{item.company || "—"}</DetailField>
        <DetailField label="Phone">{item.phone || "—"}</DetailField>
        <DetailField label="Role">
          <span
            className={
              item.role === "ADMIN"
                ? "text-brand-deep font-medium"
                : item.role === "SUPER_ADMIN"
                  ? "text-amber-700 font-medium"
                  : ""
            }
          >
            {item.role}
          </span>
        </DetailField>
        <DetailField label="Status">
          <ActiveBadge active={item.isActive} activeLabel="Active" inactiveLabel="Inactive" />
        </DetailField>
        <DetailField label="Joined">{new Date(item.createdAt).toLocaleDateString()}</DetailField>
      </div>
    </div>
  );
}

function UserFormFields({
  form,
  setForm,
  isEdit,
  isSuperAdmin,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  isEdit: boolean;
  isSuperAdmin: boolean;
}) {
  return (
    <>
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
          disabled={isEdit}
        />
      </FormField>
      {!isEdit && (
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
      {isEdit && (
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
        {isSuperAdmin ? (
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
      {isEdit && (
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
    </>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { confirm, ConfirmDialogHost } = useConfirmDialog();
  const panel = useAdminListPanel<User>();

  const fetchData = async () => {
    const res = await fetch("/api/admin/users");
    if (!res.ok) return;
    const data = await res.json();
    setUsers(data.users ?? data);
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
    setForm(userToForm(panel.selected));
    panel.openEdit();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const editing = panel.panelMode === "edit" ? panel.selected : null;
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
        const saved = await res.json();
        await fetchData();
        panel.setSelected(saved);
        panel.backToView();
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
        await fetchData();
        panel.closePanel();
      }
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
    if (panel.selected?.id === user.id) panel.closePanel();
    fetchData();
  };

  const itemLabel = panel.selected?.name ?? "Details";
  const breadcrumbItems = buildAdminBreadcrumbItems(
    "Users",
    panel.panelMode,
    panel.panelMode !== "create" ? itemLabel : undefined,
    "Add User"
  );

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

      <AdminListDetailGrid
        showSidePanel={panel.showSidePanel}
        list={
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
            onEdit={panel.openView}
            onDelete={handleDelete}
            selectedRowId={panel.activeRowId}
          />
        }
        panel={
          <>
            {panel.panelMode === "view" && panel.selected && (
              <AdminDetailPanel
                title={panel.selected.name}
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
                <UserDetailView item={panel.selected} />
              </AdminDetailPanel>
            )}

            {panel.panelMode === "edit" && panel.selected && (
              <AdminInlineForm
                title="Edit User"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                cancelLabel="Back to details"
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                className={ADMIN_PANEL_CLASS}
              >
                <UserFormFields
                  form={form}
                  setForm={setForm}
                  isEdit
                  isSuperAdmin={panel.selected.role === "SUPER_ADMIN"}
                />
              </AdminInlineForm>
            )}

            {panel.panelMode === "create" && (
              <AdminInlineForm
                title="Add User"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                className={ADMIN_PANEL_CLASS}
              >
                <UserFormFields form={form} setForm={setForm} isEdit={false} isSuperAdmin={false} />
              </AdminInlineForm>
            )}
          </>
        }
      />

      <ConfirmDialogHost />
    </div>
  );
}
