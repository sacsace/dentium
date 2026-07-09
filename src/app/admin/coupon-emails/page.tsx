"use client";

import { useEffect, useState } from "react";
import { Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FormField, inputClass } from "@/components/admin/AdminForm";
import { formatDiscountLabel } from "@/lib/coupon-utils";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";

type Coupon = { id: string; code: string; discountType: string; discountValue: string | number };
type User = { id: string; name: string; email: string; isActive: boolean };
type Campaign = {
  id: string;
  subject: string;
  segment: string;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  coupon: { code: string; discountType: string; discountValue: string | number };
};

const SEGMENTS = [
  { id: "ALL_USERS", label: "All members" },
  { id: "ACTIVE_USERS", label: "Active members only" },
  { id: "SPECIFIC_USERS", label: "Specific members" },
];

export default function AdminCouponEmailsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { confirm, showAlert } = useConfirmDialog();

  const [form, setForm] = useState({
    couponId: "",
    subject: "",
    segment: "ALL_USERS",
    message: "",
    scheduledAt: "",
    userIds: [] as string[],
  });

  const fetchData = async () => {
    const [cRes, cpRes, uRes] = await Promise.all([
      fetch("/api/admin/coupon-campaigns"),
      fetch("/api/admin/coupons"),
      fetch("/api/admin/users"),
    ]);
    if (cRes.ok) setCampaigns(await cRes.json());
    if (cpRes.ok) setCoupons(await cpRes.json());
    if (uRes.ok) {
      const data = await uRes.json();
      const list = Array.isArray(data) ? data : (data.users ?? []);
      setUsers(list.filter((u: User & { role: string }) => u.role === "USER"));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (sendNow: boolean) => {
    if (!form.couponId || !form.subject.trim()) {
      await showAlert({ variant: "warning", message: "Select a coupon and enter a subject." });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/coupon-campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sendNow }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setShowForm(false);
      setForm({ couponId: "", subject: "", segment: "ALL_USERS", message: "", scheduledAt: "", userIds: [] });
      fetchData();
      if (sendNow && data.sendResult) {
        await showAlert({
          variant: "info",
          title: "Campaign sent",
          message: `Sent to ${data.sendResult.sent} of ${data.sendResult.total} recipients.`,
        });
      }
    } else {
      await showAlert({ variant: "error", message: data.error || "Failed to create campaign" });
    }
  };

  const resend = async (id: string) => {
    const ok = await confirm({ title: "Send campaign", message: "Send this coupon email now?" });
    if (!ok) return;
    const res = await fetch(`/api/admin/coupon-campaigns/${id}/send`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      fetchData();
      await showAlert({ variant: "info", message: `Sent to ${data.result.sent} recipients.` });
    } else {
      await showAlert({ variant: "error", message: data.error || "Send failed" });
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Coupon Emails"
        description="Send coupon codes to members by segment. Schedule delivery or send immediately."
        action={
          <Button type="button" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4" /> New Campaign
          </Button>
        }
      />

      {showForm && (
        <div className="bg-white p-6 rounded-sm shadow-sm mb-8 space-y-4 max-w-2xl">
          <FormField label="Coupon">
            <select
              className={inputClass}
              value={form.couponId}
              onChange={(e) => setForm({ ...form, couponId: e.target.value })}
            >
              <option value="">Select coupon</option>
              {coupons.filter((c) => c).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {formatDiscountLabel(c.discountType as "PERCENT" | "FIXED", Number(c.discountValue))}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Subject">
            <input className={inputClass} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </FormField>
          <FormField label="Segment">
            <select className={inputClass} value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}>
              {SEGMENTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </FormField>
          {form.segment === "SPECIFIC_USERS" && (
            <FormField label="Members">
              <select
                multiple
                className={`${inputClass} min-h-[120px]`}
                value={form.userIds}
                onChange={(e) =>
                  setForm({
                    ...form,
                    userIds: Array.from(e.target.selectedOptions).map((o) => o.value),
                  })
                }
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </FormField>
          )}
          <FormField label="Custom message (optional)">
            <textarea className={inputClass} rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </FormField>
          <FormField label="Schedule (optional)">
            <input
              type="datetime-local"
              className={inputClass}
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            />
          </FormField>
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={loading} onClick={() => handleCreate(true)}>
              <Send className="w-4 h-4" /> Send Now
            </Button>
            <Button type="button" variant="secondary" disabled={loading} onClick={() => handleCreate(false)}>
              Schedule
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-sm shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-brand-gray text-left">
            <tr>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Coupon</th>
              <th className="px-4 py-3">Segment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sent</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-t border-brand-muted/40">
                <td className="px-4 py-3">{c.subject}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.coupon.code}</td>
                <td className="px-4 py-3">{c.segment}</td>
                <td className="px-4 py-3">{c.status}</td>
                <td className="px-4 py-3">
                  {c.sentCount > 0 ? `${c.sentCount} sent` : c.scheduledAt ? new Date(c.scheduledAt).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3">
                  {c.status === "SCHEDULED" && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => resend(c.id)}>
                      Send
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-silver">
                  No campaigns yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
