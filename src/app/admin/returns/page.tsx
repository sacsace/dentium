"use client";

import { useCallback, useEffect, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { AdminDetailPanel, AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminListDetailGrid } from "@/components/admin/AdminListDetailGrid";
import { FormField, inputClass } from "@/components/admin/AdminForm";
import { ADMIN_PANEL_CLASS } from "@/lib/admin-panel";
import { formatDate } from "@/lib/utils";

type ReturnRequest = {
  id: string;
  type: string;
  reason: string;
  itemNotes: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  order: { orderNumber: string; status: string; guestName: string | null };
  user: { name: string; email: string; company: string | null } | null;
};

const STATUSES = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];

export default function AdminReturnsPage() {
  const [items, setItems] = useState<ReturnRequest[]>([]);
  const [selected, setSelected] = useState<ReturnRequest | null>(null);
  const [status, setStatus] = useState("PENDING");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/returns").then((r) => r.json()).then(setItems);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openItem = (item: ReturnRequest) => {
    setSelected(item);
    setStatus(item.status);
    setAdminNotes(item.adminNotes || "");
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/admin/returns/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes }),
    });
    setSaving(false);
    if (res.ok) {
      load();
      setSelected(null);
    }
  };

  return (
    <div>
      <AdminPageHeader title="Returns & Exchanges" description="Review and process customer return and exchange requests." />

      <AdminListDetailGrid
        showSidePanel={!!selected}
        list={
          <DataTable
            columns={[
              { key: "order", label: "Order", render: (r) => r.order.orderNumber },
              { key: "type", label: "Type" },
              { key: "user", label: "Customer", render: (r) => r.user?.name || r.order.guestName || "—" },
              { key: "status", label: "Status" },
              { key: "createdAt", label: "Date", render: (r) => formatDate(r.createdAt) },
            ]}
            data={items}
            onEdit={openItem}
            editLabel="View"
            selectedRowId={selected?.id}
          />
        }
        panel={
          selected && (
            <AdminDetailPanel title={selected.order.orderNumber} onClose={() => setSelected(null)} className={ADMIN_PANEL_CLASS}>
              <div className="space-y-4 text-sm">
                <p><strong>Type:</strong> {selected.type}</p>
                <p><strong>Customer:</strong> {selected.user?.name} ({selected.user?.email})</p>
                <p><strong>Reason:</strong> {selected.reason}</p>
                {selected.itemNotes && <p><strong>Items:</strong> {selected.itemNotes}</p>}
                <FormField label="Status">
                  <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Admin notes">
                  <textarea className={inputClass} rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
                </FormField>
                <Button type="button" onClick={save} disabled={saving}>
                  {saving ? "Saving..." : "Update"}
                </Button>
              </div>
            </AdminDetailPanel>
          )
        }
      />
    </div>
  );
}
