"use client";

import { useEffect, useMemo, useState } from "react";
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

import { membershipTierLabel } from "@/lib/membership";

interface User {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  erpCustomerNumber: string | null;
  role: string;
  isActive: boolean;
  membershipTier: "ASSOCIATE" | "FULL";
  licenseDocumentUrl: string | null;
  fullMemberStatus: "NONE" | "PENDING" | "REJECTED";
  fullMemberRequestedAt: string | null;
  fullMemberReviewNote: string | null;
  gstin: string | null;
  panNumber: string | null;
  state: string | null;
  city: string | null;
  pincode: string | null;
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

const ROLE_OPTIONS = [
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
] as const;

function userToForm(user: User) {
  return {
    name: user.name,
    email: user.email,
    password: "",
    role: user.role,
    company: user.company || "",
    phone: user.phone || "",
    isActive: user.isActive,
  };
}

function fullMemberStatusLabel(status: User["fullMemberStatus"]) {
  if (status === "PENDING") return "Pending review";
  if (status === "REJECTED") return "Rejected";
  return "—";
}

function UserDetailView({ item }: { item: User }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailField label="Name">{item.name}</DetailField>
        <DetailField label="Email">{item.email}</DetailField>
        <DetailField label="Company">{item.company || "—"}</DetailField>
        <DetailField label="Phone">{item.phone || "—"}</DetailField>
        <DetailField label="GSTIN">{item.gstin || "—"}</DetailField>
        <DetailField label="PAN">{item.panNumber || "—"}</DetailField>
        <DetailField label="State">{item.state || "—"}</DetailField>
        <DetailField label="City">{item.city || "—"}</DetailField>
        <DetailField label="Pincode">{item.pincode || "—"}</DetailField>
        <DetailField label="ERP Customer #">{item.erpCustomerNumber || "—"}</DetailField>
        <DetailField label="Membership">
          <span className={item.membershipTier === "FULL" ? "text-brand-deep font-medium" : ""}>
            {membershipTierLabel(item.membershipTier)}
          </span>
        </DetailField>
        <DetailField label="Full Member Application">
          {fullMemberStatusLabel(item.fullMemberStatus)}
          {item.fullMemberRequestedAt && (
            <span className="block text-xs text-brand-silver mt-1">
              Requested {new Date(item.fullMemberRequestedAt).toLocaleString()}
            </span>
          )}
        </DetailField>
        <DetailField label="License Document">
          {item.licenseDocumentUrl ? (
            <a
              href={item.licenseDocumentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-deep hover:underline break-all"
            >
              View uploaded license
            </a>
          ) : (
            "—"
          )}
        </DetailField>
        {item.fullMemberReviewNote && (
          <DetailField label="Review Note" className="sm:col-span-2">
            {item.fullMemberReviewNote}
          </DetailField>
        )}
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
  canAssignSuperAdmin,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  isEdit: boolean;
  canAssignSuperAdmin: boolean;
}) {
  const visibleRoles = canAssignSuperAdmin
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((option) => option.value !== "SUPER_ADMIN");

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
            placeholder="At least 8 characters, with a letter and a number"
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
          <p className="mt-1 text-xs text-brand-silver">
            Enter a new password to change it. Minimum 8 characters, with a letter and a number.
          </p>
        </FormField>
      )}
      <FormField label="Role">
        <select
          className={inputClass}
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          {visibleRoles.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
  const [viewerRole, setViewerRole] = useState<string>("ADMIN");
  const [loading, setLoading] = useState(false);
  const [userFilter, setUserFilter] = useState<"all" | "pending" | "fullPending" | "active">("all");
  const [form, setForm] = useState(EMPTY_FORM);
  const { confirm, showAlert } = useConfirmDialog();
  const panel = useAdminListPanel<User>();
  const canAssignSuperAdmin = viewerRole === "SUPER_ADMIN";

  const fetchData = async () => {
    const res = await fetch("/api/admin/users");
    if (!res.ok) return;
    const data = await res.json();
    setUsers(data.users ?? data);
    if (data.viewerRole) setViewerRole(data.viewerRole);
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
          await showAlert({ variant: "error", message: data.error || "Failed to update user" });
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
          await showAlert({ variant: "error", message: data.error || "Failed to create user" });
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
      await showAlert({ variant: "warning", message: "Super admin account cannot be deleted" });
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
      await showAlert({ variant: "error", message: data.error || "Failed to delete user" });
      return;
    }
    if (panel.selected?.id === user.id) panel.closePanel();
    fetchData();
  };

  const filteredUsers = useMemo(() => {
    if (userFilter === "pending") return users.filter((u) => !u.isActive && u.role === "USER");
    if (userFilter === "fullPending") return users.filter((u) => u.fullMemberStatus === "PENDING");
    if (userFilter === "active") return users.filter((u) => u.isActive);
    return users;
  }, [users, userFilter]);

  const pendingCount = useMemo(() => users.filter((u) => !u.isActive && u.role === "USER").length, [users]);
  const fullPendingCount = useMemo(() => users.filter((u) => u.fullMemberStatus === "PENDING").length, [users]);

  const approveFullMembership = async (user: User) => {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullMemberAction: "approve" }),
    });
    if (res.ok) {
      await fetchData();
      const updated = await res.json();
      if (panel.selected?.id === user.id) panel.setSelected(updated);
      await showAlert({
        variant: "info",
        title: "Full membership approved",
        message: `${user.name} is now a Full Member. Approval email sent.`,
      });
    } else {
      const data = await res.json();
      await showAlert({ variant: "error", message: data.error || "Failed to approve full membership" });
    }
  };

  const rejectFullMembership = async (user: User) => {
    const note = window.prompt("Rejection note (optional):", user.fullMemberReviewNote || "");
    if (note === null) return;
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullMemberAction: "reject", fullMemberReviewNote: note }),
    });
    if (res.ok) {
      await fetchData();
      const updated = await res.json();
      if (panel.selected?.id === user.id) panel.setSelected(updated);
      await showAlert({ variant: "info", title: "Application rejected", message: `${user.name}'s full membership application was rejected.` });
    } else {
      const data = await res.json();
      await showAlert({ variant: "error", message: data.error || "Failed to reject application" });
    }
  };

  const approveUser = async (user: User) => {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    if (res.ok) {
      await fetchData();
      if (panel.selected?.id === user.id) {
        const updated = await res.json();
        panel.setSelected(updated);
      }
      await showAlert({ variant: "info", title: "Approved", message: `${user.name} can now log in. Approval email sent.` });
    } else {
      const data = await res.json();
      await showAlert({ variant: "error", message: data.error || "Failed to approve user" });
    }
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
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {(["all", "pending", "fullPending", "active"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setUserFilter(tab)}
                  className={`px-4 py-2 text-sm rounded-sm transition-colors ${
                    userFilter === tab ? "bg-brand-accent text-brand-navy" : "bg-brand-gray text-brand-dark"
                  }`}
                >
                  {tab === "all"
                    ? "All"
                    : tab === "pending"
                      ? `Signup (${pendingCount})`
                      : tab === "fullPending"
                        ? `Full Member (${fullPendingCount})`
                        : "Active"}
                </button>
              ))}
            </div>
            <DataTable
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "company", label: "Company", render: (u) => u.company || "—" },
              {
                key: "membershipTier",
                label: "Membership",
                render: (u) => membershipTierLabel(u.membershipTier),
              },
              {
                key: "fullMemberStatus",
                label: "Full App.",
                render: (u) => (u.fullMemberStatus === "PENDING" ? "Pending" : u.fullMemberStatus === "REJECTED" ? "Rejected" : "—"),
              },
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
            data={filteredUsers}
            onEdit={panel.openView}
            onDelete={handleDelete}
            selectedRowId={panel.activeRowId}
          />
          </>
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
                  <div className="flex flex-wrap gap-2">
                    {!panel.selected.isActive && panel.selected.role === "USER" && (
                      <Button type="button" size="sm" onClick={() => approveUser(panel.selected!)}>
                        Approve signup
                      </Button>
                    )}
                    {panel.selected.fullMemberStatus === "PENDING" && (
                      <>
                        <Button type="button" size="sm" onClick={() => approveFullMembership(panel.selected!)}>
                          Approve full member
                        </Button>
                        <Button type="button" size="sm" variant="secondary" onClick={() => rejectFullMembership(panel.selected!)}>
                          Reject
                        </Button>
                      </>
                    )}
                    <Button type="button" size="sm" variant="secondary" onClick={openEditFromDetail}>
                      Edit
                    </Button>
                  </div>
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
                  canAssignSuperAdmin={canAssignSuperAdmin}
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
                <UserFormFields form={form} setForm={setForm} isEdit={false} canAssignSuperAdmin={canAssignSuperAdmin} />
              </AdminInlineForm>
            )}
          </>
        }
      />

    </div>
  );
}
