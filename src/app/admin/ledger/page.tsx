"use client";

import { useCallback, useEffect, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { AdminDetailPanel, AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminListDetailGrid } from "@/components/admin/AdminListDetailGrid";
import { FormField, inputClass } from "@/components/admin/AdminForm";
import { ADMIN_PANEL_CLASS } from "@/lib/admin-panel";
import { formatDate } from "@/lib/utils";

type LedgerRequest = {
  id: string;
  periodFrom: string;
  periodTo: string;
  gstin: string | null;
  notes: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  user: { name: string; email: string; company: string | null; gstin: string | null };
};

const STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "REJECTED"];

export default function AdminLedgerPage() {
  const [items, setItems] = useState<LedgerRequest[]>([]);
  const [selected, setSelected] = useState<LedgerRequest | null>(null);
  const [status, setStatus] = useState("PENDING");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/ledger").then((r) => r.json()).then(setItems);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openItem = (item: LedgerRequest) => {
    setSelected(item);
    setStatus(item.status);
    setAdminNotes(item.adminNotes || "");
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/admin/ledger/${selected.id}`, {
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
      <AdminPageHeader title="Ledger Requests" description="Process GST ledger and invoice statement requests from members." />

      <AdminListDetailGrid
        showSidePanel={!!selected}
        list={
          <DataTable
            columns={[
              { key: "user", label: "Customer", render: (r) => r.user.name },
              { key: "period", label: "Period", render: (r) => `${formatDate(r.periodFrom)} – ${formatDate(r.periodTo)}` },
              { key: "gstin", label: "GSTIN", render: (r) => r.gstin || r.user.gstin || "—" },
              { key: "status", label: "Status" },
              { key: "createdAt", label: "Requested", render: (r) => formatDate(r.createdAt) },
            ]}
            data={items}
            onEdit={openItem}
            editLabel="View"
            selectedRowId={selected?.id}
          />
        }
        panel={
          selected && (
            <AdminDetailPanel title={selected.user.name} onClose={() => setSelected(null)} className={ADMIN_PANEL_CLASS}>
              <div className="space-y-4 text-sm">
                <p><strong>Email:</strong> {selected.user.email}</p>
                <p><strong>Company:</strong> {selected.user.company || "—"}</p>
                <p><strong>Period:</strong> {formatDate(selected.periodFrom)} – {formatDate(selected.periodTo)}</p>
                <p><strong>GSTIN:</strong> {selected.gstin || selected.user.gstin || "—"}</p>
                {selected.notes && <p><strong>Notes:</strong> {selected.notes}</p>}
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
