"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { AdminDetailPanel, AdminPageHeader, AdminPanelBreadcrumb } from "@/components/admin/AdminPageHeader";
import { AdminListDetailGrid } from "@/components/admin/AdminListDetailGrid";
import { ADMIN_PANEL_CLASS } from "@/lib/admin-panel";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
        isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
      }`}
    >
      {isActive ? "Active" : "Unsubscribed"}
    </span>
  );
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [selected, setSelected] = useState<Subscriber | null>(null);
  const { confirm, ConfirmDialogHost } = useConfirmDialog();

  const loadSubscribers = useCallback(() => {
    fetch("/api/admin/newsletter")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSubscribers(data);
      });
  }, []);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  const filtered = useMemo(() => {
    if (filter === "active") return subscribers.filter((s) => s.isActive);
    if (filter === "inactive") return subscribers.filter((s) => !s.isActive);
    return subscribers;
  }, [subscribers, filter]);

  const activeCount = subscribers.filter((s) => s.isActive).length;

  const toggleActive = async (item: Subscriber) => {
    const res = await fetch(`/api/admin/newsletter/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    if (res.ok) {
      loadSubscribers();
      const updated = { ...item, isActive: !item.isActive };
      setSelected((prev) => (prev?.id === item.id ? updated : prev));
    }
  };

  const handleDelete = async (item: Subscriber) => {
    const ok = await confirm({
      title: "Remove subscriber",
      message: `Remove ${item.email} from the newsletter list? This cannot be undone.`,
      confirmLabel: "Remove",
    });
    if (!ok) return;

    const res = await fetch(`/api/admin/newsletter/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      if (selected?.id === item.id) setSelected(null);
      loadSubscribers();
    }
  };

  return (
    <div>
      <ConfirmDialogHost />
      <AdminPageHeader
        title="Newsletter"
        description={`${activeCount} active subscriber${activeCount === 1 ? "" : "s"}`}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {(
          [
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "inactive", label: "Unsubscribed" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm rounded-sm transition-colors ${
              filter === tab.key ? "bg-brand-accent text-brand-navy" : "bg-brand-gray text-brand-dark hover:bg-brand-light"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AdminListDetailGrid
        showSidePanel={Boolean(selected)}
        list={
          <DataTable
            data={filtered}
            columns={[
              { key: "email", label: "Email" },
              {
                key: "source",
                label: "Source",
                render: (item) => item.source ?? "—",
              },
              {
                key: "isActive",
                label: "Status",
                render: (item) => <StatusBadge isActive={item.isActive} />,
              },
              {
                key: "subscribedAt",
                label: "Subscribed",
                render: (item) => formatDate(item.subscribedAt),
              },
            ]}
            onRowClick={setSelected}
            selectedRowId={selected?.id ?? null}
          />
        }
        panel={
          selected && (
            <AdminDetailPanel
              title={selected.email}
              breadcrumb={
                <AdminPanelBreadcrumb
                  items={[
                    { id: "list", label: "Newsletter" },
                    { id: "view", label: selected.email },
                  ]}
                  onNavigate={(id) => {
                    if (id === "list") setSelected(null);
                  }}
                />
              }
              subtitle={
                <div className="mt-1">
                  <StatusBadge isActive={selected.isActive} />
                </div>
              }
              onClose={() => setSelected(null)}
              className={ADMIN_PANEL_CLASS}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-brand-silver">Source</span>
                    <p className="font-medium">{selected.source ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-brand-silver">Subscribed</span>
                    <p className="font-medium">{formatDate(selected.subscribedAt)}</p>
                  </div>
                  {selected.unsubscribedAt && (
                    <div>
                      <span className="text-brand-silver">Unsubscribed</span>
                      <p className="font-medium">{formatDate(selected.unsubscribedAt)}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
                  <Button type="button" variant="secondary" onClick={() => toggleActive(selected)}>
                    {selected.isActive ? "Unsubscribe" : "Resubscribe"}
                  </Button>
                  <Button type="button" variant="danger" onClick={() => handleDelete(selected)}>
                    Remove
                  </Button>
                </div>
              </div>
            </AdminDetailPanel>
          )
        }
      />
    </div>
  );
}
