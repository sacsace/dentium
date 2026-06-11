"use client";

import { useCallback, useEffect, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { FormField, inputClass } from "@/components/admin/AdminForm";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";
import type { OrderStatus } from "@prisma/client";

interface QuoteItem {
  id: string;
  quantity: number;
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
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selected, setSelected] = useState<Quote | null>(null);
  const [editStatus, setEditStatus] = useState<OrderStatus>("QUOTE_REQUESTED");
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadQuotes = useCallback(() => {
    fetch("/api/admin/quotes").then((r) => r.json()).then(setQuotes);
  }, []);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

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
        body: JSON.stringify({ status: editStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelected(data);
        setQuotes((prev) => prev.map((q) => (q.id === data.id ? { ...q, status: data.status } : q)));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-navy mb-6">Quote Requests</h1>
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
        onRowClick={openQuote}
      />

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-semibold text-brand-navy">{selected.quoteNumber}</h2>
                <StatusBadge status={selected.status} />
              </div>
              <button onClick={() => setSelected(null)} className="text-brand-silver hover:text-brand-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {loadingDetail ? (
                <p className="text-sm text-brand-silver">Loading details...</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
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
                            </tr>
                          </thead>
                          <tbody>
                            {selected.items.map((item) => (
                              <tr key={item.id} className="border-t border-gray-100">
                                <td className="px-4 py-2">{item.product.name}</td>
                                <td className="px-4 py-2 text-brand-silver">{item.product.sku || "—"}</td>
                                <td className="px-4 py-2 text-right">{item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
                    <Button onClick={saveStatus} disabled={saving}>
                      {saving ? "Saving..." : "Save Status"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
