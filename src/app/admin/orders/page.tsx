"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { FormField, inputClass } from "@/components/admin/AdminForm";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Search } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { AdminDetailPanel, AdminPageHeader, AdminPanelBreadcrumb } from "@/components/admin/AdminPageHeader";
import { AdminListDetailGrid } from "@/components/admin/AdminListDetailGrid";
import { ADMIN_PANEL_CLASS } from "@/lib/admin-panel";
import { refreshAdminNavBadges } from "@/lib/admin-nav-badges";
import {
  deletedOrderMatchesKeyword,
  getDeletedOrderCustomerEmail,
  getDeletedOrderCustomerName,
  type DeletedOrderItemSnapshot,
} from "@/lib/deleted-order-utils";
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
  subtotalAmount?: string | number | null;
  discountAmount?: string | number | null;
  couponCode?: string | null;
  totalAmount: string | number | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  user?: { id: string; name: string | null; email: string | null; phone?: string | null; company?: string | null } | null;
}

interface DeletedOrderRecord {
  id: string;
  orderNumber: string;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  guestCompany: string | null;
  customerName: string | null;
  customerEmail: string | null;
  status: OrderStatus;
  notes: string | null;
  subtotalAmount?: string | number | null;
  discountAmount?: string | number | null;
  couponCode?: string | null;
  totalAmount: string | number | null;
  items: DeletedOrderItemSnapshot[];
  orderCreatedAt: string;
  deletedAt: string;
  deletedBy: string | null;
}

const ORDER_TABS: OrderListTab[] = ["received", "completed", "deleted"];

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

function OrderItemsTable({
  items,
}: {
  items: { productName: string; sku: string | null; quantity: number; price: string | number | null }[];
}) {
  return (
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
          {items.map((item, index) => (
            <tr key={index} className="border-t border-gray-100">
              <td className="px-4 py-3 text-brand-dark">{item.productName}</td>
              <td className="px-4 py-3 text-brand-silver">{item.sku || "—"}</td>
              <td className="px-4 py-3 text-right text-brand-dark">{item.quantity}</td>
              <td className="px-4 py-3 text-right text-brand-dark">{formatOrderAmount(item.price)}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-brand-silver">No items</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminOrdersPage() {
  const { confirm, showAlert } = useConfirmDialog();
  const [orders, setOrders] = useState<Order[]>([]);
  const [deletedOrders, setDeletedOrders] = useState<DeletedOrderRecord[]>([]);
  const [selectedActive, setSelectedActive] = useState<Order | null>(null);
  const [selectedDeleted, setSelectedDeleted] = useState<DeletedOrderRecord | null>(null);
  const [editStatus, setEditStatus] = useState<OrderStatus>("PENDING");
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderListTab>("received");
  const [keyword, setKeyword] = useState("");
  const [deletedLoaded, setDeletedLoaded] = useState(false);

  const loadOrders = useCallback(() => {
    fetch("/api/admin/orders").then((r) => r.json()).then(setOrders);
  }, []);

  const loadDeletedOrders = useCallback(() => {
    fetch("/api/admin/deleted-orders").then((r) => r.json()).then((data) => {
      setDeletedOrders(data);
      setDeletedLoaded(true);
    });
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const tabCounts = useMemo(() => {
    const counts: Record<OrderListTab, number> = { received: 0, completed: 0, deleted: deletedOrders.length };
    for (const order of orders) {
      if (orderMatchesTab(order.status, "received")) counts.received += 1;
      if (orderMatchesTab(order.status, "completed")) counts.completed += 1;
    }
    return counts;
  }, [orders, deletedOrders.length]);

  const filteredActiveOrders = useMemo(() => {
    return orders.filter(
      (order) => orderMatchesTab(order.status, activeTab) && orderMatchesKeyword(order, keyword)
    );
  }, [orders, activeTab, keyword]);

  const filteredDeletedOrders = useMemo(() => {
    if (activeTab !== "deleted") return [];
    return deletedOrders.filter((record) => deletedOrderMatchesKeyword(record, keyword));
  }, [deletedOrders, activeTab, keyword]);

  const closeDetail = () => {
    setSelectedActive(null);
    setSelectedDeleted(null);
  };

  const handleTabChange = (tab: OrderListTab) => {
    setActiveTab(tab);
    closeDetail();
    if (tab === "deleted" && !deletedLoaded) {
      loadDeletedOrders();
    }
  };

  const openOrder = async (item: Order) => {
    setSelectedDeleted(null);
    setSelectedActive(item);
    setEditStatus(item.status);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/orders/${item.id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedActive(data);
        setEditStatus(data.status);
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  const openDeletedOrder = async (item: DeletedOrderRecord) => {
    setSelectedActive(null);
    setSelectedDeleted(item);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/deleted-orders/${item.id}`);
      const data = await res.json();
      if (res.ok) setSelectedDeleted(data);
    } finally {
      setLoadingDetail(false);
    }
  };

  const saveStatus = async () => {
    if (!selectedActive) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedActive.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedActive(data);
        setOrders((prev) => prev.map((o) => (o.id === data.id ? { ...o, ...data } : o)));
        refreshAdminNavBadges();
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteOrders = async (items: Order[]) => {
    if (items.length === 0) return;

    const ok = await confirm({
      title: "Delete order(s)",
      message:
        items.length === 1
          ? `Order ${items[0].orderNumber} will be removed from the list and saved to Deleted records for reference.`
          : `${items.length} orders will be removed and saved to Deleted records for reference.`,
      confirmLabel: "Delete",
    });
    if (!ok) return;

    const results = await Promise.all(
      items.map(async (order) => {
        const res = await fetch(`/api/admin/orders/${order.id}`, { method: "DELETE" });
        const data = await res.json().catch(() => ({}));
        return { order, ok: res.ok, error: data.error as string | undefined };
      })
    );

    const failed = results.filter((r) => !r.ok);
    const deletedIds = new Set(results.filter((r) => r.ok).map((r) => r.order.id));

    if (selectedActive && deletedIds.has(selectedActive.id)) closeDetail();
    setOrders((prev) => prev.filter((o) => !deletedIds.has(o.id)));
    if (deletedIds.size > 0) {
      loadDeletedOrders();
      refreshAdminNavBadges();
    }

    if (failed.length > 0) {
      const lines = failed.map((r) => `• ${r.order.orderNumber}: ${r.error ?? "Delete failed"}`);
      await showAlert({
        variant: "error",
        title: "Could not delete order(s)",
        message:
          failed.length === items.length
            ? lines.join("\n")
            : `${items.length - failed.length} deleted, ${failed.length} failed:\n\n${lines.join("\n")}`,
      });
    }
  };

  const handleDeleteSelected = (order: Order) => deleteOrders([order]);
  const handleBulkDelete = (items: Order[]) => deleteOrders(items);
  const canDeleteActive = activeTab === "received" || activeTab === "completed";
  const selectedRowId = selectedActive?.id ?? selectedDeleted?.id ?? null;

  return (
    <div>
      <AdminPageHeader title="Orders" />

      <AdminListDetailGrid
        showSidePanel={Boolean(selectedActive || selectedDeleted)}
        list={
          <>
            <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200">
              {ORDER_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
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

            {activeTab === "deleted" ? (
              <DataTable
                columns={[
                  { key: "orderNumber", label: "Order #" },
                  { key: "customerName", label: "Customer", render: (o) => getDeletedOrderCustomerName(o) },
                  { key: "customerEmail", label: "Email", render: (o) => getDeletedOrderCustomerEmail(o) },
                  { key: "status", label: "Status", render: (o) => <StatusBadge status={o.status} /> },
                  { key: "totalAmount", label: "Total", render: (o) => formatOrderAmount(o.totalAmount) },
                  { key: "orderCreatedAt", label: "Order Date", render: (o) => new Date(o.orderCreatedAt).toLocaleDateString() },
                  { key: "deletedAt", label: "Deleted", render: (o) => new Date(o.deletedAt).toLocaleDateString() },
                ]}
                data={filteredDeletedOrders}
                mobileTitleKey="orderNumber"
                onRowClick={openDeletedOrder}
                selectedRowId={selectedRowId}
              />
            ) : (
              <DataTable
                columns={[
                  { key: "orderNumber", label: "Order #" },
                  { key: "guestName", label: "Customer", render: (o) => getCustomerName(o) },
                  { key: "guestEmail", label: "Email", render: (o) => getCustomerEmail(o) },
                  { key: "status", label: "Status", render: (o) => <StatusBadge status={o.status} /> },
                  { key: "totalAmount", label: "Total", render: (o) => formatOrderAmount(o.totalAmount) },
                  { key: "createdAt", label: "Date", render: (o) => new Date(o.createdAt).toLocaleDateString() },
                ]}
                data={filteredActiveOrders}
                mobileTitleKey="orderNumber"
                onRowClick={openOrder}
                selectedRowId={selectedRowId}
                selectable={canDeleteActive}
                onBulkDelete={canDeleteActive ? handleBulkDelete : undefined}
                bulkDeleteLabel="Delete orders"
                onDelete={canDeleteActive ? handleDeleteSelected : undefined}
              />
            )}
          </>
        }
        panel={
          selectedActive ? (
            <AdminDetailPanel
              title={selectedActive.orderNumber}
              subtitle={
                <div className="mt-1">
                  <StatusBadge status={selectedActive.status} />
                </div>
              }
              loading={loadingDetail}
              onClose={closeDetail}
              className={ADMIN_PANEL_CLASS}
              breadcrumb={
                <AdminPanelBreadcrumb
                  items={[
                    { id: "list", label: "Orders" },
                    { id: "view", label: selectedActive.orderNumber },
                  ]}
                  onNavigate={(id) => id === "list" && closeDetail()}
                />
              }
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-brand-silver">Customer</span>
                    <p className="font-medium">{getCustomerName(selectedActive)}</p>
                  </div>
                  <div>
                    <span className="text-brand-silver">Email</span>
                    <p className="font-medium">{getCustomerEmail(selectedActive)}</p>
                  </div>
                  <div>
                    <span className="text-brand-silver">Phone</span>
                    <p className="font-medium">{selectedActive.guestPhone || selectedActive.user?.phone || "—"}</p>
                  </div>
                  <div>
                    <span className="text-brand-silver">Company</span>
                    <p className="font-medium">{selectedActive.guestCompany || selectedActive.user?.company || "—"}</p>
                  </div>
                  <div>
                    <span className="text-brand-silver">Order Date</span>
                    <p className="font-medium">{new Date(selectedActive.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-brand-silver">Total Amount</span>
                    <p className="font-medium">{formatOrderAmount(selectedActive.totalAmount)}</p>
                  </div>
                  {selectedActive.couponCode && (
                    <>
                      <div>
                        <span className="text-brand-silver">Coupon</span>
                        <p className="font-medium">{selectedActive.couponCode}</p>
                      </div>
                      <div>
                        <span className="text-brand-silver">Discount</span>
                        <p className="font-medium text-green-700">
                          -{formatOrderAmount(selectedActive.discountAmount)}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {selectedActive.notes && (
                  <div>
                    <h4 className="text-sm font-semibold text-brand-navy mb-2">Customer Notes</h4>
                    <p className="text-sm text-brand-dark whitespace-pre-wrap bg-brand-gray/40 p-4 rounded-sm">{selectedActive.notes}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-brand-navy mb-3">Order Items</h4>
                  <OrderItemsTable
                    items={(selectedActive.items ?? []).map((item) => ({
                      productName: item.product.name,
                      sku: item.product.sku,
                      quantity: item.quantity,
                      price: item.price,
                    }))}
                  />
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
                    <Button onClick={saveStatus} disabled={saving || editStatus === selectedActive.status} className="w-full sm:w-auto">
                      {saving ? "Saving..." : "Save Status"}
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => handleDeleteSelected(selectedActive)}
                      className="w-full sm:w-auto"
                    >
                      Delete Order
                    </Button>
                    <Button type="button" variant="ghost" onClick={closeDetail} className="w-full sm:w-auto">
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </AdminDetailPanel>
          ) : selectedDeleted ? (
            <AdminDetailPanel
              title={selectedDeleted.orderNumber}
              subtitle={
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <StatusBadge status={selectedDeleted.status} />
                  <span className="text-xs text-brand-silver">Archived record</span>
                </div>
              }
              loading={loadingDetail}
              onClose={closeDetail}
              className={ADMIN_PANEL_CLASS}
              breadcrumb={
                <AdminPanelBreadcrumb
                  items={[
                    { id: "list", label: "Orders" },
                    { id: "deleted", label: "Deleted" },
                    { id: "view", label: selectedDeleted.orderNumber },
                  ]}
                  onNavigate={(id) => (id === "list" || id === "deleted") && closeDetail()}
                />
              }
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-brand-silver">Customer</span>
                    <p className="font-medium">{getDeletedOrderCustomerName(selectedDeleted)}</p>
                  </div>
                  <div>
                    <span className="text-brand-silver">Email</span>
                    <p className="font-medium">{getDeletedOrderCustomerEmail(selectedDeleted)}</p>
                  </div>
                  <div>
                    <span className="text-brand-silver">Phone</span>
                    <p className="font-medium">{selectedDeleted.guestPhone || "—"}</p>
                  </div>
                  <div>
                    <span className="text-brand-silver">Company</span>
                    <p className="font-medium">{selectedDeleted.guestCompany || "—"}</p>
                  </div>
                  <div>
                    <span className="text-brand-silver">Order Date</span>
                    <p className="font-medium">{new Date(selectedDeleted.orderCreatedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-brand-silver">Deleted At</span>
                    <p className="font-medium">{new Date(selectedDeleted.deletedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-brand-silver">Total Amount</span>
                    <p className="font-medium">{formatOrderAmount(selectedDeleted.totalAmount)}</p>
                  </div>
                  <div>
                    <span className="text-brand-silver">Deleted By</span>
                    <p className="font-medium">{selectedDeleted.deletedBy || "—"}</p>
                  </div>
                </div>

                {selectedDeleted.notes && (
                  <div>
                    <h4 className="text-sm font-semibold text-brand-navy mb-2">Customer Notes</h4>
                    <p className="text-sm text-brand-dark whitespace-pre-wrap bg-brand-gray/40 p-4 rounded-sm">{selectedDeleted.notes}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-brand-navy mb-3">Order Items</h4>
                  <OrderItemsTable items={selectedDeleted.items ?? []} />
                </div>

                <div className="border-t pt-6">
                  <Button type="button" variant="ghost" onClick={closeDetail} className="w-full sm:w-auto">
                    Close
                  </Button>
                </div>
              </div>
            </AdminDetailPanel>
          ) : null
        }
      />
    </div>
  );
}
