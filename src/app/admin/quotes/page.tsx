"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { FormField, inputClass } from "@/components/admin/AdminForm";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { AdminDetailPanel, AdminPageHeader, AdminPanelBreadcrumb } from "@/components/admin/AdminPageHeader";
import { AdminListDetailGrid } from "@/components/admin/AdminListDetailGrid";
import { ADMIN_PANEL_CLASS } from "@/lib/admin-panel";
import type { OrderStatus } from "@prisma/client";

interface QuoteItem {
  id: string;
  quantity: number;
  unitPrice: string | number | null;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string | null;
    brand?: string | null;
  };
}

interface Quote {
  id: string;
  quoteNumber: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  status: OrderStatus;
  totalAmount?: string | number | null;
  createdAt: string;
  items?: QuoteItem[];
  user?: { id: string; name: string | null; email: string | null; phone?: string | null; company?: string | null } | null;
}

const QUOTE_STATUSES: OrderStatus[] = ["QUOTE_REQUESTED", "QUOTE_SENT", "CONFIRMED", "CANCELLED"];

const QUOTE_STATUS_LABELS: Record<string, string> = {
  QUOTE_REQUESTED: "Requested",
  QUOTE_SENT: "Quote Sent",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Partial<Record<OrderStatus, string>> = {
    QUOTE_REQUESTED: "bg-amber-100 text-amber-800",
    QUOTE_SENT: "bg-blue-100 text-blue-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-800"}`}>
      {QUOTE_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default function AdminQuotesPage() {
  const { confirm, showAlert } = useConfirmDialog();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selected, setSelected] = useState<Quote | null>(null);
  const [editStatus, setEditStatus] = useState<OrderStatus>("QUOTE_REQUESTED");
  const [itemPrices, setItemPrices] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const quoteTotal = useMemo(() => {
    if (!selected?.items) return 0;
    return selected.items.reduce((sum, item) => {
      const price = Number(itemPrices[item.id] ?? item.unitPrice ?? 0);
      return sum + (Number.isFinite(price) ? price : 0) * item.quantity;
    }, 0);
  }, [selected?.items, itemPrices]);

  const loadQuotes = useCallback(() => {
    fetch("/api/admin/quotes").then((r) => r.json()).then(setQuotes);
  }, []);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const closeDetail = () => setSelected(null);

  const openQuote = async (item: Quote) => {
    setSelected(item);
    setEditStatus(item.status);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/quotes/${item.id}`);
      const data = await res.json();
      if (res.ok) {
        setSelected(data);
        setEditStatus(data.status);
        const prices: Record<string, string> = {};
        for (const item of data.items ?? []) {
          prices[item.id] = item.unitPrice != null ? String(item.unitPrice) : "";
        }
        setItemPrices(prices);
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  const saveStatus = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/quotes/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          items: selected.items?.map((item) => ({
            id: item.id,
            unitPrice: itemPrices[item.id] ?? item.unitPrice,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelected(data);
        setQuotes((prev) => prev.map((q) => (q.id === data.id ? { ...q, ...data } : q)));
      }
    } finally {
      setSaving(false);
    }
  };

  const sendQuote = async () => {
    if (!selected) return;
    const ok = await confirm({
      title: "Send quote email",
      message: `Send quote ${selected.quoteNumber} to ${selected.email} with total ${quoteTotal > 0 ? `₹${quoteTotal.toLocaleString("en-IN")}` : "amount TBD"}?`,
      confirmLabel: "Send Email",
    });
    if (!ok) return;

    setSending(true);
    try {
      const res = await fetch(`/api/admin/quotes/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          sendQuoteEmail: true,
          items: selected.items?.map((item) => ({
            id: item.id,
            unitPrice: itemPrices[item.id],
          })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelected(data);
        setEditStatus(data.status);
        setQuotes((prev) => prev.map((q) => (q.id === data.id ? { ...q, ...data } : q)));
        await showAlert({ variant: "info", title: "Quote sent", message: `Email sent to ${selected.email}` });
      } else {
        await showAlert({ variant: "error", message: data.error || "Failed to send quote email" });
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <AdminPageHeader title="Quote Requests" />

      <AdminListDetailGrid
        showSidePanel={Boolean(selected)}
        list={
          <DataTable
            columns={[
              { key: "quoteNumber", label: "Quote #" },
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "company", label: "Company", render: (q) => q.company || "—" },
              { key: "status", label: "Status", render: (q) => <StatusBadge status={q.status} /> },
              { key: "createdAt", label: "Date", render: (q) => new Date(q.createdAt).toLocaleDateString() },
            ]}
            data={quotes}
            mobileTitleKey="quoteNumber"
            onRowClick={openQuote}
            selectedRowId={selected?.id ?? null}
          />
        }
        panel={
          selected && (
            <AdminDetailPanel
              title={selected.quoteNumber}
              subtitle={<StatusBadge status={selected.status} />}
              loading={loadingDetail}
              onClose={closeDetail}
              className={ADMIN_PANEL_CLASS}
              breadcrumb={
                <AdminPanelBreadcrumb
                  items={[
                    { id: "list", label: "Quote Requests" },
                    { id: "view", label: selected.quoteNumber },
                  ]}
                  onNavigate={(id) => id === "list" && closeDetail()}
                />
              }
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-brand-silver">Name</span><p className="font-medium">{selected.name}</p></div>
                  <div><span className="text-brand-silver">Email</span><p className="font-medium">{selected.email}</p></div>
                  <div><span className="text-brand-silver">Phone</span><p className="font-medium">{selected.phone || "—"}</p></div>
                  <div><span className="text-brand-silver">Company</span><p className="font-medium">{selected.company || "—"}</p></div>
                  <div className="col-span-2"><span className="text-brand-silver">Submitted</span><p className="font-medium">{new Date(selected.createdAt).toLocaleString()}</p></div>
                </div>

                {selected.message && (
                  <div>
                    <h4 className="text-sm font-semibold text-brand-navy mb-2">Message</h4>
                    <p className="text-sm text-brand-dark whitespace-pre-wrap bg-brand-gray/40 p-4 rounded-sm">{selected.message}</p>
                  </div>
                )}

                {selected.items && selected.items.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-brand-navy mb-3">Requested Products</h4>
                    <div className="border border-gray-100 rounded-sm overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-brand-gray">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-brand-navy">Product</th>
                            <th className="px-4 py-2 text-left font-medium text-brand-navy">SKU</th>
                            <th className="px-4 py-2 text-right font-medium text-brand-navy">Qty</th>
                            <th className="px-4 py-2 text-right font-medium text-brand-navy">Unit Price (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.items.map((item) => (
                            <tr key={item.id} className="border-t border-gray-100">
                              <td className="px-4 py-2">{item.product.name}</td>
                              <td className="px-4 py-2 text-brand-silver">{item.product.sku || "—"}</td>
                              <td className="px-4 py-2 text-right">{item.quantity}</td>
                              <td className="px-4 py-2 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className={`${inputClass} w-28 ml-auto`}
                                  value={itemPrices[item.id] ?? ""}
                                  onChange={(e) => setItemPrices({ ...itemPrices, [item.id]: e.target.value })}
                                  placeholder="0"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {quoteTotal > 0 && (
                        <p className="text-right text-sm font-medium text-brand-navy mt-3 pr-4">
                          Total: ₹{quoteTotal.toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold text-brand-navy">Update Status</h3>
                  <FormField label="Status">
                    <select className={inputClass} value={editStatus} onChange={(e) => setEditStatus(e.target.value as OrderStatus)}>
                      {QUOTE_STATUSES.map((s) => (
                        <option key={s} value={s}>{QUOTE_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </FormField>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-4">
                    <Button onClick={saveStatus} disabled={saving} className="w-full sm:w-auto">
                      {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button type="button" variant="outline" onClick={sendQuote} disabled={sending || quoteTotal <= 0} className="w-full sm:w-auto">
                      {sending ? "Sending..." : "Send Quote Email"}
                    </Button>
                  </div>
                </div>
              </div>
            </AdminDetailPanel>
          )
        }
      />
    </div>
  );
}
