"use client";

import { useCallback, useEffect, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { FormField, inputClass } from "@/components/admin/AdminForm";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

type InquiryStatus = "PENDING" | "CONFIRMED" | "COMPLETED";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  type: string;
  status: InquiryStatus;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<InquiryStatus, string> = {
  PENDING: "New",
  CONFIRMED: "Reviewed",
  COMPLETED: "Completed",
};

function StatusBadge({ status }: { status: InquiryStatus }) {
  const styles: Record<InquiryStatus, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [replyError, setReplyError] = useState("");
  const [replySending, setReplySending] = useState(false);

  const loadInquiries = useCallback(() => {
    fetch("/api/admin/inquiries").then((r) => r.json()).then(setInquiries);
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const openInquiry = async (item: Inquiry) => {
    setLoading(true);
    setReplyError("");
    setReplyMessage("");
    try {
      const res = await fetch(`/api/admin/inquiries/${item.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setSelected(data);
      setReplySubject(data.subject ? `Re: ${data.subject}` : "Re: Your inquiry to Dentium");
      setInquiries((prev) =>
        prev.map((i) => (i.id === data.id ? { ...i, status: data.status } : i))
      );
    } catch {
      setReplyError("Failed to load inquiry details.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelected(null);
    setReplyError("");
    setReplyMessage("");
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !replyMessage.trim()) return;

    setReplySending(true);
    setReplyError("");
    try {
      const res = await fetch(`/api/admin/inquiries/${selected.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: replySubject, message: replyMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");

      setSelected(data);
      setInquiries((prev) => prev.map((i) => (i.id === data.id ? data : i)));
      setReplyMessage("");
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : "Failed to send email.");
    } finally {
      setReplySending(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-navy mb-6">Contact Inquiries</h1>
      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "subject", label: "Subject", render: (i) => i.subject || "—" },
          { key: "type", label: "Type" },
          {
            key: "status",
            label: "Status",
            render: (i) => <StatusBadge status={i.status} />,
          },
          {
            key: "createdAt",
            label: "Date",
            render: (i) => new Date(i.createdAt).toLocaleDateString(),
          },
        ]}
        data={inquiries}
        onRowClick={openInquiry}
        onEdit={openInquiry}
        editLabel="View"
      />

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-semibold text-brand-navy">Inquiry Details</h2>
                <StatusBadge status={selected.status} />
              </div>
              <button onClick={closeModal} className="text-brand-silver hover:text-brand-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {loading ? (
                <p className="text-sm text-brand-silver">Loading...</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-brand-silver">Name</span>
                      <p className="font-medium text-brand-navy">{selected.name}</p>
                    </div>
                    <div>
                      <span className="text-brand-silver">Email</span>
                      <p className="font-medium text-brand-navy">{selected.email}</p>
                    </div>
                    {selected.phone && (
                      <div>
                        <span className="text-brand-silver">Phone</span>
                        <p className="font-medium text-brand-navy">{selected.phone}</p>
                      </div>
                    )}
                    {selected.company && (
                      <div>
                        <span className="text-brand-silver">Company</span>
                        <p className="font-medium text-brand-navy">{selected.company}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-brand-silver">Type</span>
                      <p className="font-medium text-brand-navy">{selected.type}</p>
                    </div>
                    <div>
                      <span className="text-brand-silver">Date</span>
                      <p className="font-medium text-brand-navy">
                        {new Date(selected.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {selected.subject && (
                    <div>
                      <span className="text-sm text-brand-silver">Subject</span>
                      <p className="font-medium text-brand-navy">{selected.subject}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-sm text-brand-silver">Message</span>
                    <div className="mt-1 p-4 bg-brand-gray rounded-sm text-sm text-brand-dark whitespace-pre-wrap">
                      {selected.message}
                    </div>
                  </div>

                  {selected.adminReply && (
                    <div>
                      <span className="text-sm text-brand-silver">
                        Sent Reply
                        {selected.repliedAt && (
                          <span className="ml-2">
                            ({new Date(selected.repliedAt).toLocaleString()})
                          </span>
                        )}
                      </span>
                      <div className="mt-1 p-4 bg-green-50 rounded-sm text-sm text-brand-dark whitespace-pre-wrap">
                        {selected.adminReply}
                      </div>
                    </div>
                  )}

                  {selected.status !== "COMPLETED" && (
                    <form onSubmit={handleReply} className="border-t pt-4 space-y-4">
                      <h3 className="font-semibold text-brand-navy">Reply by Email</h3>
                      {replyError && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-sm">
                          {replyError}
                        </div>
                      )}
                      <FormField label="Subject">
                        <input
                          className={inputClass}
                          value={replySubject}
                          onChange={(e) => setReplySubject(e.target.value)}
                        />
                      </FormField>
                      <FormField label="Message">
                        <textarea
                          className={inputClass}
                          rows={6}
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Write your reply..."
                          required
                        />
                      </FormField>
                      <Button type="submit" disabled={replySending}>
                        {replySending ? "Sending..." : "Send Reply & Mark Complete"}
                      </Button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
