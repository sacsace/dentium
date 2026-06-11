"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Send } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { FormField, inputClass } from "@/components/admin/AdminForm";
import { AdminDetailModal, AdminDetailPanel, AdminPageHeader, AdminPanelBreadcrumb } from "@/components/admin/AdminPageHeader";
import { AdminListDetailGrid } from "@/components/admin/AdminListDetailGrid";
import { ADMIN_PANEL_CLASS } from "@/lib/admin-panel";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { isRichTextEmpty } from "@/lib/newsletter-mail";

const RichTextEditor = dynamic(
  () => import("@/components/admin/RichTextEditor").then((m) => m.RichTextEditor),
  { ssr: false, loading: () => <div className="h-[320px] border border-gray-200 rounded-sm bg-brand-gray/30 animate-pulse" /> }
);

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

interface SendResult {
  sent: number;
  failed: number;
  total: number;
  errors?: { email: string; error: string }[];
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
  const [showCompose, setShowCompose] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendError, setSendError] = useState("");
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [sending, setSending] = useState(false);
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

  const openCompose = () => {
    setSubject("");
    setMessage("");
    setSendError("");
    setSendResult(null);
    setShowCompose(true);
  };

  const closeCompose = () => {
    if (sending) return;
    setShowCompose(false);
    setSendError("");
    setSendResult(null);
  };

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setSendError("Subject is required.");
      return;
    }
    if (isRichTextEmpty(message)) {
      setSendError("Message is required.");
      return;
    }

    if (activeCount === 0) {
      setSendError("No active subscribers to send to.");
      return;
    }

    const ok = await confirm({
      title: "Send newsletter",
      message: `Send this newsletter to ${activeCount} active subscriber${activeCount === 1 ? "" : "s"}?`,
      confirmLabel: "Send",
    });
    if (!ok) return;

    setSending(true);
    setSendError("");
    setSendResult(null);

    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send newsletter.");

      setSendResult({
        sent: data.sent,
        failed: data.failed,
        total: data.total,
        errors: data.errors,
      });
      setSubject("");
      setMessage("");
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send newsletter.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <ConfirmDialogHost />
      <AdminPageHeader
        title="Newsletter"
        description={`${activeCount} active subscriber${activeCount === 1 ? "" : "s"}`}
        action={
          <Button type="button" onClick={openCompose}>
            <Send className="w-4 h-4 mr-2" />
            Compose Newsletter
          </Button>
        }
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

      <AdminDetailModal
        open={showCompose}
        onClose={closeCompose}
        title="Compose Newsletter"
        subtitle={
          <p className="text-sm text-brand-silver mt-1">
            Will be sent to {activeCount} active subscriber{activeCount === 1 ? "" : "s"}.
            {activeCount === 0 && " Add subscribers before sending."}
          </p>
        }
        wide
      >
        {sendResult ? (
          <div className="space-y-4">
            <div className="rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Newsletter sent to {sendResult.sent} of {sendResult.total} subscriber
              {sendResult.total === 1 ? "" : "s"}.
              {sendResult.failed > 0 && ` ${sendResult.failed} failed.`}
            </div>
            {sendResult.errors && sendResult.errors.length > 0 && (
              <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p className="font-medium mb-2">Failed deliveries</p>
                <ul className="space-y-1">
                  {sendResult.errors.map((item) => (
                    <li key={item.email}>
                      {item.email}: {item.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="button" onClick={openCompose}>
                Compose Another
              </Button>
              <Button type="button" variant="ghost" onClick={closeCompose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            {sendError && (
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded-sm border border-red-200">
                {sendError}
              </div>
            )}

            <FormField label="Subject" required>
              <input
                className={inputClass}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Newsletter subject"
                required
              />
            </FormField>

            <FormField label="Message" required>
              <RichTextEditor
                value={message}
                onChange={setMessage}
                placeholder="Write your newsletter content..."
              />
            </FormField>

            <p className="text-xs text-brand-silver">
              Emails are sent individually to protect subscriber privacy. Configure SMTP in Admin &gt; Settings before sending.
            </p>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-gray-100">
              <Button type="button" variant="ghost" onClick={closeCompose} disabled={sending}>
                Cancel
              </Button>
              <Button type="submit" disabled={sending || activeCount === 0}>
                {sending ? "Sending..." : `Send to ${activeCount} subscriber${activeCount === 1 ? "" : "s"}`}
              </Button>
            </div>
          </form>
        )}
      </AdminDetailModal>
    </div>
  );
}
