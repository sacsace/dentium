"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/admin/DataTable";
import { AdminInlineForm, FormField, inputClass, inputErrorClass } from "@/components/admin/AdminForm";
import { AdminDetailPanel, AdminPageHeader, AdminPanelBreadcrumb } from "@/components/admin/AdminPageHeader";
import { ActiveBadge, DetailField } from "@/components/admin/AdminDetailFields";
import { AdminListDetailGrid } from "@/components/admin/AdminListDetailGrid";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { TeamPhotoField } from "@/components/admin/TeamPhotoField";
import { DEFAULT_PHOTO_FOCAL } from "@/lib/detect-face-center";
import { useAdminListPanel } from "@/hooks/useAdminListPanel";
import { ADMIN_PANEL_CLASS, buildAdminBreadcrumbItems } from "@/lib/admin-panel";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string | null;
  bio: string | null;
  photoUrl: string;
  photoFocalX: number;
  photoFocalY: number;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY_FORM = {
  name: "",
  role: "",
  department: "",
  bio: "",
  photoUrl: "",
  photoFocalX: DEFAULT_PHOTO_FOCAL.x,
  photoFocalY: DEFAULT_PHOTO_FOCAL.y,
  sortOrder: "0",
  isActive: true,
};

function itemToForm(item: TeamMember) {
  return {
    name: item.name,
    role: item.role,
    department: item.department ?? "",
    bio: item.bio ?? "",
    photoUrl: item.photoUrl,
    photoFocalX: item.photoFocalX ?? DEFAULT_PHOTO_FOCAL.x,
    photoFocalY: item.photoFocalY ?? DEFAULT_PHOTO_FOCAL.y,
    sortOrder: String(item.sortOrder),
    isActive: item.isActive,
  };
}

function TeamMemberDetailView({ item }: { item: TeamMember }) {
  return (
    <div className="space-y-6">
      <DetailField label="Photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.photoUrl}
          alt={item.name}
          className="mt-2 w-24 h-24 rounded-full object-cover border border-gray-200 grayscale-[0.85]"
          style={{
            objectPosition: `${item.photoFocalX ?? 50}% ${item.photoFocalY ?? 38}%`,
          }}
        />
      </DetailField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailField label="Name">{item.name}</DetailField>
        <DetailField label="Role">{item.role}</DetailField>
        <DetailField label="Department">{item.department || "—"}</DetailField>
        <DetailField label="Sort Order">{item.sortOrder}</DetailField>
        <DetailField label="Status">
          <ActiveBadge active={item.isActive} activeLabel="Active" inactiveLabel="Hidden" />
        </DetailField>
      </div>
      {item.bio && (
        <DetailField label="Bio">
          <span className="whitespace-pre-wrap">{item.bio}</span>
        </DetailField>
      )}
    </div>
  );
}

function TeamMemberFormFields({
  form,
  setForm,
  fieldErrors,
  updateForm,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  fieldErrors: Record<string, string>;
  updateForm: <K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) => void;
}) {
  return (
    <>
      <FormField label="Photo" required error={fieldErrors.photoUrl}>
        <TeamPhotoField
          value={{
            photoUrl: form.photoUrl,
            photoFocalX: form.photoFocalX,
            photoFocalY: form.photoFocalY,
          }}
          onChange={({ photoUrl, photoFocalX, photoFocalY }) => {
            setForm((prev) => ({ ...prev, photoUrl, photoFocalX, photoFocalY }));
          }}
          hasError={!!fieldErrors.photoUrl}
        />
      </FormField>
      <FormField label="Name" required error={fieldErrors.name}>
        <input
          className={fieldErrors.name ? inputErrorClass : inputClass}
          value={form.name}
          onChange={(e) => updateForm("name", e.target.value)}
          placeholder="Full name"
        />
      </FormField>
      <FormField label="Role / Title" required error={fieldErrors.role}>
        <input
          className={fieldErrors.role ? inputErrorClass : inputClass}
          value={form.role}
          onChange={(e) => updateForm("role", e.target.value)}
          placeholder="e.g. Sales Manager"
        />
      </FormField>
      <FormField label="Department">
        <input
          className={inputClass}
          value={form.department}
          onChange={(e) => updateForm("department", e.target.value)}
          placeholder="e.g. Sales, HR, Marketing"
        />
      </FormField>
      <FormField label="Bio (optional)">
        <textarea
          className={inputClass}
          rows={3}
          value={form.bio}
          onChange={(e) => updateForm("bio", e.target.value)}
          placeholder="Short introduction..."
        />
      </FormField>
      <FormField label="Sort Order">
        <input
          type="number"
          className={inputClass}
          value={form.sortOrder}
          onChange={(e) => updateForm("sortOrder", e.target.value)}
        />
      </FormField>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
        />
        Active (visible on Our Team page)
      </label>
    </>
  );
}

export default function AdminTeamMembersPage() {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { confirm, ConfirmDialogHost } = useConfirmDialog();
  const panel = useAdminListPanel<TeamMember>();

  const clearErrors = () => {
    setFormError(null);
    setFieldErrors({});
  };

  const updateForm = <K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (formError && key !== "bio" && key !== "department" && key !== "sortOrder" && key !== "isActive") {
      setFormError(null);
    }
  };

  const fetchData = async () => {
    const res = await fetch("/api/admin/team-members");
    if (res.ok) setItems(await res.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    clearErrors();
    panel.openCreate();
  };

  const openEditFromDetail = () => {
    if (!panel.selected) return;
    setForm(itemToForm(panel.selected));
    clearErrors();
    panel.openEdit();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const errors: Record<string, string> = {};
    if (!form.photoUrl.trim()) errors.photoUrl = "Please upload a photo";
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.role.trim()) errors.role = "Role / title is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError("Please check the highlighted fields below.");
      return;
    }

    setLoading(true);
    try {
      const editing = panel.panelMode === "edit" ? panel.selected : null;
      const url = editing ? `/api/admin/team-members/${editing.id}` : "/api/admin/team-members";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || "Failed to save team member. Please try again.");
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

  const handleDelete = async (item: TeamMember) => {
    const ok = await confirm({
      title: "Delete team member",
      message: `"${item.name}" will be permanently removed.`,
    });
    if (!ok) return;
    await fetch(`/api/admin/team-members/${item.id}`, { method: "DELETE" });
    if (panel.selected?.id === item.id) panel.closePanel();
    fetchData();
  };

  const itemLabel = panel.selected?.name ?? "Details";
  const breadcrumbItems = buildAdminBreadcrumbItems(
    "Team Members",
    panel.panelMode,
    panel.panelMode !== "create" ? itemLabel : undefined,
    "Add Member"
  );

  return (
    <div>
      <AdminPageHeader
        title="Team Members"
        description="Register employee photos and details shown on the Our Team page."
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Member
          </Button>
        }
      />

      <AdminListDetailGrid
        showSidePanel={panel.showSidePanel}
        list={
          <DataTable
            columns={[
              {
                key: "photoUrl",
                label: "Photo",
                sortable: false,
                render: (item) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 grayscale-[0.85]"
                    style={{
                      objectPosition: `${item.photoFocalX ?? 50}% ${item.photoFocalY ?? 38}%`,
                    }}
                  />
                ),
              },
              { key: "name", label: "Name" },
              { key: "role", label: "Role" },
              { key: "department", label: "Department", render: (item) => item.department || "—" },
              { key: "sortOrder", label: "Order", sortValue: (item) => item.sortOrder },
              { key: "isActive", label: "Active", render: (item) => (item.isActive ? "Yes" : "No") },
            ]}
            data={items}
            searchPlaceholder="Search by name, role, department..."
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
                <TeamMemberDetailView item={panel.selected} />
              </AdminDetailPanel>
            )}

            {panel.panelMode === "edit" && panel.selected && (
              <AdminInlineForm
                title="Edit Team Member"
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
                <TeamMemberFormFields form={form} setForm={setForm} fieldErrors={fieldErrors} updateForm={updateForm} />
              </AdminInlineForm>
            )}

            {panel.panelMode === "create" && (
              <AdminInlineForm
                title="Add Team Member"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                error={formError}
                className={ADMIN_PANEL_CLASS}
              >
                <TeamMemberFormFields form={form} setForm={setForm} fieldErrors={fieldErrors} updateForm={updateForm} />
              </AdminInlineForm>
            )}
          </>
        }
      />

      <ConfirmDialogHost />
    </div>
  );
}
