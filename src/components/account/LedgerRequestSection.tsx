"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass } from "@/components/admin/AdminForm";
import { formatDate } from "@/lib/utils";

type LedgerItem = {
  id: string;
  periodFrom: string;
  periodTo: string;
  gstin: string | null;
  status: string;
  createdAt: string;
};

export function LedgerRequestSection({ defaultGstin, embedded = false }: { defaultGstin?: string | null; embedded?: boolean }) {
  const [requests, setRequests] = useState<LedgerItem[]>([]);
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [gstin, setGstin] = useState(defaultGstin || "");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const load = () => {
    fetch("/api/account/ledger")
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
    const res = await fetch("/api/account/ledger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ periodFrom, periodTo, gstin, notes }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setNotes("");
      setMessage("Ledger request submitted. We will email your statement when ready.");
      load();
    } else {
      setMessage(data.error || "Failed to submit request");
    }
  };

  return (
    <div className={embedded ? "" : "mb-12"}>
      {!embedded && (
        <>
          <h2 className="text-xl font-semibold text-brand-navy tracking-tight mb-2">Ledger / Invoice Request</h2>
          <p className="text-brand-silver text-sm mb-4">
            Request a GST ledger or invoice summary for a specific period.
          </p>
        </>
      )}

      {requests.length > 0 && (
        <div className="space-y-2 mb-6">
          {requests.map((r) => (
            <div key={r.id} className="bg-brand-gray p-4 rounded-xl text-sm">
              <p className="font-medium text-brand-navy">
                {formatDate(r.periodFrom)} – {formatDate(r.periodTo)} · {r.status}
              </p>
              <p className="text-brand-silver mt-1">Requested {formatDate(r.createdAt)}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-brand-gray p-6 rounded-xl space-y-4 max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Period From">
            <input required type="date" className={inputClass} value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
          </FormField>
          <FormField label="Period To">
            <input required type="date" className={inputClass} value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
          </FormField>
        </div>
        <FormField label="GSTIN">
          <input className={inputClass} value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="Optional" />
        </FormField>
        <FormField label="Notes (optional)">
          <textarea className={inputClass} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
        {message && <p className="text-sm text-brand-deep">{message}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Request Ledger"}
        </Button>
      </form>
    </div>
  );
}
