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
import { formatDiscountLabel, generateCouponCode, type DiscountType } from "@/lib/coupon-utils";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: string | number;
  minOrderAmount: string | number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

const EMPTY_FORM = {
  code: "",
  description: "",
  discountType: "PERCENT" as DiscountType,
  discountValue: "",
  minOrderAmount: "",
  maxUses: "",
  expiresAt: "",
  isActive: true,
};

function couponToForm(c: Coupon) {
  return {
    code: c.code ?? "",
    description: c.description ?? "",
    discountType: c.discountType,
    discountValue: String(c.discountValue ?? ""),
    minOrderAmount: c.minOrderAmount != null ? String(c.minOrderAmount) : "",
    maxUses: c.maxUses != null ? String(c.maxUses) : "",
    expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
    isActive: c.isActive ?? true,
  };
}

function CouponDetailView({ item }: { item: Coupon }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailField label="Code">{item.code}</DetailField>
        <DetailField label="Discount">
          {formatDiscountLabel(item.discountType, Number(item.discountValue))}
        </DetailField>
        <DetailField label="Min Order">
          {item.minOrderAmount != null ? `₹${Number(item.minOrderAmount).toLocaleString("en-IN")}` : "—"}
        </DetailField>
        <DetailField label="Usage">
          {item.usedCount}
          {item.maxUses != null ? ` / ${item.maxUses}` : " (unlimited)"}
        </DetailField>
        <DetailField label="Expires">
          {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : "—"}
        </DetailField>
        <DetailField label="Status">
          <ActiveBadge active={item.isActive} />
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

function CouponFormFields({
  form,
  setForm,
  isCreate = false,
  onRegenerateCode,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  isCreate?: boolean;
  onRegenerateCode?: () => void;
}) {
  return (
    <>
      <FormField label="Coupon Code">
        <div className="flex gap-2">
          <input
            required
            readOnly={isCreate}
            className={`${inputClass} uppercase flex-1 ${isCreate ? "bg-gray-50" : ""}`}
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="Auto-generated"
          />
          {isCreate && onRegenerateCode && (
            <Button type="button" variant="outline" onClick={onRegenerateCode}>
              Regenerate
            </Button>
          )}
        </div>
        {isCreate && (
          <p className="text-xs text-brand-silver mt-1">10-character code generated automatically.</p>
        )}
      </FormField>
      <FormField label="Description">
        <input
          className={inputClass}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Optional note for admins"
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Discount Type">
          <select
            className={inputClass}
            value={form.discountType}
            onChange={(e) => setForm({ ...form, discountType: e.target.value as DiscountType })}
          >
            <option value="PERCENT">Percent (%)</option>
            <option value="FIXED">Fixed amount (₹)</option>
          </select>
        </FormField>
        <FormField label="Discount Value">
          <input
            required
            type="number"
            min="0"
            step="0.01"
            className={inputClass}
            value={form.discountValue}
            onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Min Order Amount (₹)">
          <input
            type="number"
            min="0"
            className={inputClass}
            value={form.minOrderAmount}
            onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
            placeholder="Optional"
          />
        </FormField>
        <FormField label="Max Uses">
          <input
            type="number"
            min="1"
            className={inputClass}
            value={form.maxUses}
            onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
            placeholder="Unlimited"
          />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Expires On">
          <input
            type="date"
            className={inputClass}
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
          />
        </FormField>
        <label className="flex items-center gap-2 text-sm pt-6">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />{" "}
          Active
        </label>
      </div>
    </>
  );
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { confirm, showAlert } = useConfirmDialog();
  const panel = useAdminListPanel<Coupon>();

  const fetchData = async () => {
    const res = await fetch("/api/admin/coupons");
    if (res.ok) setCoupons(await res.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, code: generateCouponCode() });
    panel.openCreate();
  };

  const regenerateCode = () => {
    setForm((prev) => ({ ...prev, code: generateCouponCode() }));
  };

  const openEditFromDetail = () => {
    if (!panel.selected) return;
    setForm(couponToForm(panel.selected));
    panel.openEdit();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const editing = panel.panelMode === "edit" ? panel.selected : null;
    const url = editing ? `/api/admin/coupons/${editing.id}` : "/api/admin/coupons";
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);

    if (res.ok) {
      await fetchData();
      panel.closePanel();
    } else {
      const data = await res.json().catch(() => ({}));
      await showAlert({ variant: "error", message: data.error || "Failed to save coupon" });
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    const ok = await confirm({
      title: "Delete coupon",
      message: `"${coupon.code}" will be permanently deleted.`,
    });
    if (!ok) return;

    const res = await fetch(`/api/admin/coupons/${coupon.id}`, { method: "DELETE" });
    if (res.ok) {
      if (panel.selected?.id === coupon.id) panel.closePanel();
      fetchData();
    } else {
      const data = await res.json().catch(() => ({}));
      await showAlert({ variant: "error", message: data.error || "Failed to delete coupon" });
    }
  };

  const itemLabel = panel.selected?.code ?? "Details";
  const breadcrumbItems = buildAdminBreadcrumbItems(
    "Coupons",
    panel.panelMode,
    panel.panelMode !== "create" ? itemLabel : undefined,
    "Add Coupon"
  );

  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        action={
          <Button type="button" onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Coupon
          </Button>
        }
      />

      <AdminListDetailGrid
        showSidePanel={panel.showSidePanel}
        list={
          <DataTable
            columns={[
              { key: "code", label: "Code", sortable: true },
              {
                key: "discountType",
                label: "Discount",
                render: (c) => formatDiscountLabel(c.discountType, Number(c.discountValue)),
              },
              {
                key: "usedCount",
                label: "Used",
                render: (c) => (c.maxUses != null ? `${c.usedCount} / ${c.maxUses}` : String(c.usedCount)),
              },
              {
                key: "isActive",
                label: "Active",
                render: (c) => <ActiveBadge active={c.isActive} />,
              },
            ]}
            data={coupons}
            onEdit={panel.openView}
            onDelete={handleDelete}
            selectedRowId={panel.activeRowId}
          />
        }
        panel={
          <>
            {panel.panelMode === "view" && panel.selected && (
              <AdminDetailPanel
                title={panel.selected.code}
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
                <CouponDetailView item={panel.selected} />
              </AdminDetailPanel>
            )}

            {panel.panelMode === "edit" && panel.selected && (
              <AdminInlineForm
                title="Edit Coupon"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                cancelLabel="Back to details"
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                className={ADMIN_PANEL_CLASS}
              >
                <CouponFormFields form={form} setForm={setForm} />
              </AdminInlineForm>
            )}

            {panel.panelMode === "create" && (
              <AdminInlineForm
                title="Add Coupon"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                className={ADMIN_PANEL_CLASS}
              >
                <CouponFormFields form={form} setForm={setForm} isCreate onRegenerateCode={regenerateCode} />
              </AdminInlineForm>
            )}
          </>
        }
      />
    </div>
  );
}
