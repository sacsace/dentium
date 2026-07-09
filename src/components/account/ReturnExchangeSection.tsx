"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass } from "@/components/admin/AdminForm";

type OrderOption = { id: string; orderNumber: string };

type ReturnItem = {
  id: string;
  type: string;
  reason: string;
  status: string;
  createdAt: string;
  order: { orderNumber: string; status: string };
};

export function ReturnExchangeSection({ orders, embedded = false }: { orders: OrderOption[]; embedded?: boolean }) {
  const [requests, setRequests] = useState<ReturnItem[]>([]);
  const [orderId, setOrderId] = useState("");
  const [type, setType] = useState<"RETURN" | "EXCHANGE">("RETURN");
  const [reason, setReason] = useState("");
  const [itemNotes, setItemNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const load = () => {
    fetch("/api/account/returns")
      .then((r) => (r.ok ? r.json() : []))
      .then(setRequests);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/account/returns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, type, reason, itemNotes }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setReason("");
      setItemNotes("");
      setOrderId("");
      setMessage("Request submitted. Our team will contact you shortly.");
      load();
    } else {
      setMessage(data.error || "Failed to submit request");
    }
  };

  return (
    <div className={embedded ? "" : "mb-12"}>
      {!embedded && (
        <h2 className="text-xl font-semibold text-brand-navy tracking-tight mb-4">Returns & Exchanges</h2>
      )}

      {requests.length > 0 && (
        <div className="space-y-2 mb-6">
          {requests.map((r) => (
            <div key={r.id} className="bg-brand-gray p-4 rounded-xl text-sm">
              <p className="font-medium text-brand-navy">
                {r.order.orderNumber} · {r.type} · {r.status}
              </p>
              <p className="text-brand-silver mt-1">{r.reason}</p>
            </div>
          ))}
        </div>
      )}

      {orders.length === 0 ? (
        <p className="text-brand-silver text-sm">Place an order first to request a return or exchange.</p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-brand-gray p-6 rounded-xl space-y-4 max-w-xl">
          <FormField label="Order">
            <select
              required
              className={inputClass}
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            >
              <option value="">Select order</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Request Type">
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as "RETURN" | "EXCHANGE")}>
              <option value="RETURN">Return</option>
              <option value="EXCHANGE">Exchange</option>
            </select>
          </FormField>
          <FormField label="Reason">
            <textarea required className={inputClass} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </FormField>
          <FormField label="Items / Details (optional)">
            <textarea className={inputClass} rows={2} value={itemNotes} onChange={(e) => setItemNotes(e.target.value)} />
          </FormField>
          {message && <p className="text-sm text-brand-deep">{message}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      )}
    </div>
  );
}
