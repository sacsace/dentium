"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
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
    if (res.ok) loadSubscribers();
  };

  const handleDelete = async (item: Subscriber) => {
    const ok = await confirm({
      title: "Remove subscriber",
      message: `Remove ${item.email} from the newsletter list? This cannot be undone.`,
      confirmLabel: "Remove",
    });
    if (!ok) return;

    const res = await fetch(`/api/admin/newsletter/${item.id}`, { method: "DELETE" });
    if (res.ok) loadSubscribers();
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
        getEditLabel={(item) => (item.isActive ? "Unsubscribe" : "Resubscribe")}
        onEdit={(item) => toggleActive(item)}
        onDelete={handleDelete}
      />
    </div>
  );
}
