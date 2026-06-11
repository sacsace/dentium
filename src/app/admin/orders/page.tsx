"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { FormField, inputClass } from "@/components/admin/AdminForm";
import { Button } from "@/components/ui/Button";
import { Search } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { AdminDetailPanel, AdminPageHeader, AdminPanelBreadcrumb } from "@/components/admin/AdminPageHeader";
import { AdminListDetailGrid } from "@/components/admin/AdminListDetailGrid";
import { ADMIN_PANEL_CLASS } from "@/lib/admin-panel";
import {
  formatOrderAmount,
  getCustomerEmail,
  getCustomerName,
  ORDER_FULFILLMENT_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_TAB_LABELS,
  orderMatchesKeyword,
  orderMatchesTab,
  type OrderListTab,
} from "@/lib/order";

interface OrderItem {
  id: string;
  quantity: number;
  price: string | number | null;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string | null;
    brand?: string | null;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  guestCompany: string | null;
  status: OrderStatus;
  notes: string | null;
  totalAmount: string | number | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  user?: { id: string; name: string | null; email: string | null; phone?: string | null; company?: string | null } | null;
}

const ORDER_TABS: OrderListTab[] = ["received", "completed"];

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Partial<Record<OrderStatus, string>> = {
    PENDING: "bg-amber-100 text-amber-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-indigo-100 text-indigo-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-800"}`}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<OrderStatus>("PENDING");
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderListTab>("received");
  const [keyword, setKeyword] = useState("");

  const loadOrders = useCallback(() => {
    fetch("/api/admin/orders").then((r) => r.json()).then(setOrders);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const tabCounts = useMemo(() => {
    const counts: Record<OrderListTab, number> = { received: 0, completed: 0 };
    for (const order of orders) {
      if (orderMatchesTab(order.status, "received")) counts.received += 1;
      if (orderMatchesTab(order.status, "completed")) counts.completed += 1;
    }
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) => orderMatchesTab(order.status, activeTab) && orderMatchesKeyword(order, keyword)
    );
  }, [orders, activeTab, keyword]);

  const closeDetail = () => setSelected(null);

  const openOrder = async (item: Order) => {
    setSelected(item);
    setEditStatus(item.status);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/orders/${item.id}`);
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
      const res = await fetch(`/api/admin/orders/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelected(data);
        setOrders((prev) => prev.map((o) => (o.id === data.id ? { ...o, ...data } : o)));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader title="Orders" />

      <AdminListDetailGrid
        showSidePanel={Boolean(selected)}
        list={
          <>
            <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200">
              {ORDER_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === tab
                      ? "border-brand-accent text-brand-navy"
                      : "border-transparent text-brand-silver hover:text-brand-dark"
                  }`}
                >
                  {ORDER_TAB_LABELS[tab]}
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                    activeTab === tab ? "bg-brand-accent/15 text-brand-navy" : "bg-brand-gray text-brand-silver"
                  }`}>
                    {tabCounts[tab]}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-4 mb-4">
              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver" />
                <input
                  className={`${inputClass} pl-9`}
                  placeholder="Search order #, customer, email, phone, company, product..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>

            <DataTable
              columns={[
                { key: "orderNumber", label: "Order #" },
                { key: "guestName", label: "Customer", render: (o) => getCustomerName(o) },
                { key: "guestEmail", label: "Email", render: (o) => getCustomerEmail(o) },
                { key: "status", label: "Status", render: (o) => <StatusBadge status={o.status} /> },
                {
                  key: "totalAmount",
                  label: "Total",
                  render: (o) => formatOrderAmount(o.totalAmount),
                },
                { key: "createdAt", label: "Date", render: (o) => new Date(o.createdAt).toLocaleDateString() },
              ]}
              data={filteredOrders}
              mobileTitleKey="orderNumber"
              onRowClick={openOrder}
              selectedRowId={selected?.id ?? null}
            />
          </>
        }
        panel={
          selected && (
            <AdminDetailPanel
              title={selected.orderNumber}
              subtitle={
                <div className="mt-1">
                  <StatusBadge status={selected.status} />
                </div>
              }
              loading={loadingDetail}
              onClose={closeDetail}
              className={ADMIN_PANEL_CLASS}
              breadcrumb={
                <AdminPanelBreadcrumb
                  items={[
                    { id: "list", label: "Orders" },
                    { id: "view", label: selected.orderNumber },
                  ]}
                  onNavigate={(id) => id === "list" && closeDetail()}
                />
              }
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-brand-silver">Customer</span>
                    <p className="font-medium">{getCustomerName(selected)}</p>
                  </div>
                  <div>
                    <span className="text-brand-silver">Email</span>
                    <p className="font-medium">{getCustomerEmail(selected)}</p>
                  </div>
                  <div>
                    <span className="text-brand-silver">Phone</span>
                    <p className="font-medium">{selected.guestPhone || selected.user?.phone || "—"}</p>
                  </div>
                  <div>
                    <span className="text-brand-silver">Company</span>
                    <p className="font-medium">{selected.guestCompany || selected.user?.company || "—"}</p>
                  </div>
                  <div>
                    <span className="text-brand-silver">Order Date</span>
                    <p className="font-medium">{new Date(selected.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-brand-silver">Total Amount</span>
                    <p className="font-medium">{formatOrderAmount(selected.totalAmount)}</p>
                  </div>
                </div>

                {selected.notes && (
                  <div>
                    <h4 className="text-sm font-semibold text-brand-navy mb-2">Customer Notes</h4>
                    <p className="text-sm text-brand-dark whitespace-pre-wrap bg-brand-gray/40 p-4 rounded-sm">{selected.notes}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-brand-navy mb-3">Order Items</h4>
                  <div className="border border-gray-100 rounded-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-brand-gray">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-brand-navy">Product</th>
                          <th className="px-4 py-2 text-left font-medium text-brand-navy">SKU</th>
                          <th className="px-4 py-2 text-right font-medium text-brand-navy">Qty</th>
                          <th className="px-4 py-2 text-right font-medium text-brand-navy">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selected.items ?? []).map((item) => (
                          <tr key={item.id} className="border-t border-gray-100">
                            <td className="px-4 py-3 text-brand-dark">{item.product.name}</td>
                            <td className="px-4 py-3 text-brand-silver">{item.product.sku || "—"}</td>
                            <td className="px-4 py-3 text-right text-brand-dark">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-brand-dark">{formatOrderAmount(item.price)}</td>
                          </tr>
                        ))}
                        {(selected.items ?? []).length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-brand-silver">No items</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <FormField label="Update Status">
                    <select
                      className={inputClass}
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                    >
                      {ORDER_FULFILLMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </FormField>
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <Button onClick={saveStatus} disabled={saving || editStatus === selected.status} className="w-full sm:w-auto">
                      {saving ? "Saving..." : "Save Status"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={closeDetail} className="w-full sm:w-auto">
                      Close
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
