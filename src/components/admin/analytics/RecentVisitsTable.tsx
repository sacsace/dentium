"use client";

import { useMemo, useState } from "react";
import {
  ACCESS_TYPE_LABELS,
  RECENT_VISITS_PAGE_SIZE,
  type AccessType,
} from "@/lib/analytics-access";

export type RecentVisitRow = {
  id: string;
  path: string;
  device: string | null;
  referrer: string | null;
  accessType: AccessType;
  createdAt: string;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecentVisitsTable({ visits }: { visits: RecentVisitRow[] }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(visits.length / RECENT_VISITS_PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);

  const pageRows = useMemo(() => {
    const start = safePage * RECENT_VISITS_PAGE_SIZE;
    return visits.slice(start, start + RECENT_VISITS_PAGE_SIZE);
  }, [visits, safePage]);

  if (visits.length === 0) {
    return <p className="text-brand-silver text-sm">No visits recorded yet.</p>;
  }

  const from = safePage * RECENT_VISITS_PAGE_SIZE + 1;
  const to = Math.min((safePage + 1) * RECENT_VISITS_PAGE_SIZE, visits.length);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-brand-silver border-b border-brand-gray">
              <th className="pb-3 font-medium">Time</th>
              <th className="pb-3 font-medium">Page</th>
              <th className="pb-3 font-medium">Device</th>
              <th className="pb-3 font-medium">Access</th>
              <th className="pb-3 font-medium">Referrer</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((visit) => (
              <tr key={visit.id} className="border-b border-brand-gray/60 last:border-0">
                <td className="py-3 pr-4 text-brand-silver whitespace-nowrap">
                  {formatDateTime(visit.createdAt)}
                </td>
                <td className="py-3 pr-4 font-mono text-xs text-brand-navy">{visit.path}</td>
                <td className="py-3 pr-4 capitalize text-brand-silver">{visit.device || "unknown"}</td>
                <td className="py-3 pr-4 text-brand-navy">{ACCESS_TYPE_LABELS[visit.accessType]}</td>
                <td className="py-3 text-brand-silver text-xs truncate max-w-xs">
                  {visit.referrer || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
        <p className="text-brand-silver">
          Showing {from}–{to} of {visits.length}
          {visits.length >= 45 ? " (latest 45)" : ""}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="px-3 py-1.5 border border-brand-muted text-brand-navy disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-gray/60 transition-colors"
          >
            Previous
          </button>
          <span className="text-brand-silver tabular-nums px-1">
            {safePage + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage >= pageCount - 1}
            className="px-3 py-1.5 border border-brand-muted text-brand-navy disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-gray/60 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
