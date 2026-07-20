"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FormField, inputClass } from "@/components/admin/AdminForm";
import { Button } from "@/components/ui/Button";
import { ChevronUp, ChevronDown, Download, ExternalLink } from "lucide-react";
import { adminFileDownloadUrl } from "@/lib/admin-file-urls";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { AdminDetailPanel, AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { cn } from "@/lib/utils";
import {
  ATTACHMENT_LABELS,
  formatAppliedPosition,
  getJobCategoryLabel,
  JOB_CATEGORIES,
  resumeMatchesExperienceFilter,
  resumeMatchesKeyword,
  type EducationEntry,
  type ExperienceEntry,
  type ExperienceFilter,
  type ResumeAttachmentType,
} from "@/lib/resume";
import { Search, XCircle } from "lucide-react";

type ResumeStatus = "PENDING" | "REVIEWING" | "ACCEPTED" | "REJECTED";
type SortMode = "manual" | "newest" | "oldest" | "status";

interface ResumeAttachment {
  id: string;
  type: ResumeAttachmentType;
  fileName: string;
  fileUrl: string;
}

interface ResumeApplication {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  positionCategory: string | null;
  position: string | null;
  photoUrl: string | null;
  dateOfBirth: string | null;
  address: string | null;
  summary: string | null;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: string | null;
  languages: string | null;
  hasExperience: boolean;
  status: ResumeStatus;
  adminNotes: string | null;
  sortOrder: number;
  reviewedAt: string | null;
  createdAt: string;
  attachments: ResumeAttachment[];
  job: { id: string; title: string; slug: string } | null;
}

const STATUS_LABELS: Record<ResumeStatus, string> = {
  PENDING: "Pending",
  REVIEWING: "Reviewing",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

const STATUS_OPTIONS: ResumeStatus[] = ["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"];

function StatusBadge({ status }: { status: ResumeStatus }) {
  const styles: Record<ResumeStatus, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    REVIEWING: "bg-blue-100 text-blue-800",
    ACCEPTED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function AdminResumesPage() {
  const [resumes, setResumes] = useState<ResumeApplication[]>([]);
  const [selected, setSelected] = useState<ResumeApplication | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("manual");
  const [statusFilter, setStatusFilter] = useState<ResumeStatus | "ALL">("ALL");
  const [experienceFilter, setExperienceFilter] = useState<ExperienceFilter>("ALL");
  const [keyword, setKeyword] = useState("");
  const [positionQuery, setPositionQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [saving, setSaving] = useState(false);
  const [editStatus, setEditStatus] = useState<ResumeStatus>("PENDING");
  const [editNotes, setEditNotes] = useState("");
  const { confirm } = useConfirmDialog();

  const loadResumes = useCallback(() => {
    fetch("/api/admin/resumes").then((r) => r.json()).then(setResumes);
  }, []);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  const hasActiveFilters =
    Boolean(keyword.trim()) ||
    Boolean(positionQuery.trim()) ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    statusFilter !== "ALL" ||
    experienceFilter !== "ALL" ||
    categoryFilter !== "ALL";

  const canManualReorder = sortMode === "manual" && !hasActiveFilters;

  const filteredResumes = useMemo(() => {
    let list = [...resumes];

    if (statusFilter !== "ALL") {
      list = list.filter((r) => r.status === statusFilter);
    }

    if (experienceFilter !== "ALL") {
      list = list.filter((r) => resumeMatchesExperienceFilter(r, experienceFilter));
    }

    if (categoryFilter !== "ALL") {
      list = list.filter((r) => r.positionCategory === categoryFilter);
    }

    if (keyword.trim()) {
      list = list.filter((r) => resumeMatchesKeyword(r, keyword));
    }

    if (positionQuery.trim()) {
      const q = positionQuery.trim().toLowerCase();
      list = list.filter((r) =>
        formatAppliedPosition(r.positionCategory, r.position).toLowerCase().includes(q) ||
        (r.position ?? "").toLowerCase().includes(q)
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      list = list.filter((r) => new Date(r.createdAt).getTime() >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((r) => new Date(r.createdAt).getTime() <= to.getTime());
    }

    switch (sortMode) {
      case "newest":
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "status":
        list.sort((a, b) => a.status.localeCompare(b.status) || a.sortOrder - b.sortOrder);
        break;
      default:
        list.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return list;
  }, [resumes, sortMode, statusFilter, experienceFilter, categoryFilter, keyword, positionQuery, dateFrom, dateTo]);

  const clearFilters = () => {
    setKeyword("");
    setPositionQuery("");
    setCategoryFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setStatusFilter("ALL");
    setExperienceFilter("ALL");
  };

  const openResume = async (item: ResumeApplication) => {
    setDetailLoading(true);
    setSelected(null);
    try {
      const res = await fetch(`/api/admin/resumes/${item.id}`);
      const data = await res.json();
      if (res.ok) {
        setSelected(data);
        setEditStatus(data.status);
        setEditNotes(data.adminNotes ?? "");
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelected(null);
    setDetailLoading(false);
  };

  const saveReview = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/admin/resumes/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: editStatus, adminNotes: editNotes }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setSelected(data);
      setResumes((prev) => prev.map((r) => (r.id === data.id ? data : r)));
    }
  };

  const moveItem = async (id: string, direction: "up" | "down") => {
    const idx = filteredResumes.findIndex((r) => r.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= filteredResumes.length) return;

    const reordered = [...filteredResumes];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];

    await fetch("/api/admin/resumes/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: reordered.map((r) => r.id) }),
    });
    loadResumes();
  };

  const handleDelete = async (item: ResumeApplication) => {
    const ok = await confirm({
      title: "Delete application",
      message: `The application from "${item.name}" will be permanently deleted. This action cannot be undone.`,
    });
    if (!ok) return;
    await fetch(`/api/admin/resumes/${item.id}`, { method: "DELETE" });
    if (selected?.id === item.id) closeDetail();
    loadResumes();
  };

  const showSidePanel = detailLoading || Boolean(selected);

  return (
    <div>
      <AdminPageHeader title="Resume Applications" />

      <div className={cn("grid gap-6", showSidePanel && "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]")}>
        <div className="min-w-0 space-y-4">
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Search name, email, skills, school, company, notes..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <select
            className={`${inputClass} lg:w-44`}
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value as ExperienceFilter)}
          >
            <option value="ALL">All experience levels</option>
            <option value="FRESHER">Fresher / Entry-level</option>
            <option value="EXPERIENCED">Experienced</option>
          </select>
          <select
            className={`${inputClass} lg:w-40`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ResumeStatus | "ALL")}
          >
            <option value="ALL">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select
            className={`${inputClass} lg:w-44`}
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
          >
            <option value="manual">Sort: Manual order</option>
            <option value="newest">Sort: Newest first</option>
            <option value="oldest">Sort: Oldest first</option>
            <option value="status">Sort: By status</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-brand-silver mb-1">Department / role</label>
            <select className={inputClass} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="ALL">All departments</option>
              {JOB_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-brand-silver mb-1">Position keyword</label>
            <input
              className={inputClass}
              placeholder="Search role text..."
              value={positionQuery}
              onChange={(e) => setPositionQuery(e.target.value)}
            />
          </div>
          <div className="min-w-[140px]">
            <label className="block text-xs text-brand-silver mb-1">Submitted from</label>
            <input type="date" className={inputClass} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="min-w-[140px]">
            <label className="block text-xs text-brand-silver mb-1">Submitted to</label>
            <input type="date" className={inputClass} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          {hasActiveFilters && (
            <Button type="button" variant="ghost" onClick={clearFilters} className="shrink-0">
              <XCircle className="w-4 h-4" />
              Clear filters
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-brand-silver">
          <span>{filteredResumes.length} of {resumes.length} application(s)</span>
          {!hasActiveFilters && (
            <span className="text-xs">Click a row to view details</span>
          )}
          {hasActiveFilters && sortMode === "manual" && (
            <span className="text-amber-700 text-xs">Manual reorder is disabled while filters are active</span>
          )}
        </div>
      </div>

      <div className="md:hidden bg-white rounded-sm shadow-sm divide-y divide-gray-100 border border-gray-100">
        {filteredResumes.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => openResume(item)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openResume(item);
              }
            }}
            className={cn(
              "p-4 space-y-2 cursor-pointer",
              selected?.id === item.id ? "bg-brand-accent/10" : "hover:bg-brand-gray/40"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-brand-navy">{item.name}</p>
              <StatusBadge status={item.status} />
            </div>
            <p className="text-sm text-brand-silver">{item.email}</p>
            <p className="text-xs text-brand-silver">{getJobCategoryLabel(item.positionCategory)} · {new Date(item.createdAt).toLocaleDateString()}</p>
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item);
                }}
                className="text-red-500 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredResumes.length === 0 && (
          <p className="px-4 py-10 text-center text-brand-silver text-sm">No applications found</p>
        )}
      </div>

      <div className="hidden md:block bg-white rounded-sm shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-brand-gray">
            <tr>
              {canManualReorder && <th className="px-3 py-3 w-16" />}
              <th className="px-4 py-3 text-left font-medium text-brand-navy">Name</th>
              <th className="px-4 py-3 text-left font-medium text-brand-navy">Email</th>
              <th className="px-4 py-3 text-left font-medium text-brand-navy">Department</th>
              <th className="px-4 py-3 text-left font-medium text-brand-navy">Position</th>
              <th className="px-4 py-3 text-left font-medium text-brand-navy">Experience</th>
              <th className="px-4 py-3 text-left font-medium text-brand-navy">Status</th>
              <th className="px-4 py-3 text-left font-medium text-brand-navy">Date</th>
              <th className="px-4 py-3 text-right font-medium text-brand-navy w-20">Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredResumes.map((item, index) => (
              <tr
                key={item.id}
                onClick={() => openResume(item)}
                className={cn(
                  "border-t border-gray-100 cursor-pointer",
                  selected?.id === item.id
                    ? "bg-brand-accent/10 hover:bg-brand-accent/15"
                    : "hover:bg-brand-gray/50"
                )}
              >
                {canManualReorder && (
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveItem(item.id, "up")}
                        className="p-0.5 text-brand-silver hover:text-brand-navy disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={index === filteredResumes.length - 1}
                        onClick={() => moveItem(item.id, "down")}
                        className="p-0.5 text-brand-silver hover:text-brand-navy disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
                <td className="px-4 py-3 text-brand-dark">{item.name}</td>
                <td className="px-4 py-3 text-brand-dark">{item.email}</td>
                <td className="px-4 py-3 text-brand-dark">{getJobCategoryLabel(item.positionCategory)}</td>
                <td className="px-4 py-3 text-brand-dark">{item.job?.title || item.position || "—"}</td>
                <td className="px-4 py-3 text-brand-dark text-xs">
                  {resumeMatchesExperienceFilter(item, "EXPERIENCED") ? (
                    <span className="text-brand-deep">Experienced</span>
                  ) : (
                    <span className="text-brand-silver">Fresher</span>
                  )}
                </td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3 text-brand-dark">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="text-red-500 hover:underline text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredResumes.length === 0 && (
              <tr>
                <td colSpan={canManualReorder ? 9 : 8} className="px-4 py-10 text-center text-brand-silver">
                  No applications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
        </div>

        {showSidePanel && (
          <AdminDetailPanel
            title={selected?.name ?? "Application details"}
            subtitle={
              selected ? (
                <div className="mt-1">
                  <StatusBadge status={selected.status} />
                </div>
              ) : undefined
            }
            loading={detailLoading && !selected}
            onClose={closeDetail}
            className="xl:sticky xl:top-6 xl:self-start"
          >
            {selected && (
              <div className="space-y-6">
                {selected.photoUrl && (
                  <div className="relative w-20 h-24 rounded-sm overflow-hidden border border-gray-200 md:hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/admin/resumes/${selected.id}/photo`} alt={selected.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><span className="text-brand-silver">Email</span><p className="font-medium">{selected.email}</p></div>
                <div><span className="text-brand-silver">Phone</span><p className="font-medium">{selected.phone || "—"}</p></div>
                <div><span className="text-brand-silver">Department</span><p className="font-medium">{getJobCategoryLabel(selected.positionCategory)}</p></div>
                <div><span className="text-brand-silver">Position</span><p className="font-medium">{selected.job?.title || formatAppliedPosition(selected.positionCategory, selected.position)}</p></div>
                <div><span className="text-brand-silver">Date of Birth</span><p className="font-medium">{selected.dateOfBirth || "—"}</p></div>
                <div className="col-span-2"><span className="text-brand-silver">Address</span><p className="font-medium">{selected.address || "—"}</p></div>
                <div><span className="text-brand-silver">Submitted</span><p className="font-medium">{new Date(selected.createdAt).toLocaleString()}</p></div>
              </div>

              {selected.summary && (
                <div>
                  <h4 className="text-sm font-semibold text-brand-navy mb-2">Career Summary</h4>
                  <p className="text-sm text-brand-dark whitespace-pre-wrap bg-brand-gray/40 p-4 rounded-sm">{selected.summary}</p>
                </div>
              )}

              {selected.education?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-brand-navy mb-2">Education</h4>
                  <div className="space-y-3">
                    {selected.education.map((ed, i) => (
                      <div key={i} className="text-sm border border-gray-100 p-3 rounded-sm">
                        <p className="font-medium text-brand-navy">{ed.school}</p>
                        <p className="text-brand-silver">{[ed.degree, ed.field].filter(Boolean).join(" · ")}</p>
                        <p className="text-xs text-brand-silver mt-1">{ed.startDate} — {ed.endDate || "Present"}</p>
                        {ed.description && <p className="mt-2 text-brand-dark">{ed.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.hasExperience && selected.experience?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-brand-navy mb-2">Work Experience</h4>
                  <div className="space-y-3">
                    {selected.experience.map((ex, i) => (
                      <div key={i} className="text-sm border border-gray-100 p-3 rounded-sm">
                        <p className="font-medium text-brand-navy">{ex.title} @ {ex.company}</p>
                        <p className="text-xs text-brand-silver mt-1">{ex.startDate} — {ex.current ? "Present" : ex.endDate}</p>
                        {ex.description && <p className="mt-2 text-brand-dark whitespace-pre-wrap">{ex.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selected.skills || selected.languages) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {selected.skills && (
                    <div><h4 className="font-semibold text-brand-navy mb-1">Skills</h4><p className="whitespace-pre-wrap">{selected.skills}</p></div>
                  )}
                  {selected.languages && (
                    <div><h4 className="font-semibold text-brand-navy mb-1">Languages</h4><p className="whitespace-pre-wrap">{selected.languages}</p></div>
                  )}
                </div>
              )}

              {selected.attachments?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-brand-navy mb-3">Supporting Documents</h4>
                  <div className="space-y-2">
                    {selected.attachments.map((att) => (
                      <div key={att.id} className="flex items-center justify-between gap-3 text-sm border border-gray-100 px-3 py-2 rounded-sm">
                        <div className="min-w-0">
                          <p className="font-medium text-brand-navy truncate">{att.fileName}</p>
                          <p className="text-xs text-brand-silver">{ATTACHMENT_LABELS[att.type]}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <a href={adminFileDownloadUrl("attachment", att.id)} download={att.fileName} className="p-1.5 text-brand-deep hover:bg-brand-gray rounded-sm" title="Download">
                            <Download className="w-4 h-4" />
                          </a>
                          <a href={adminFileDownloadUrl("attachment", att.id)} target="_blank" rel="noopener noreferrer" className="p-1.5 text-brand-deep hover:bg-brand-gray rounded-sm" title="Open">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold text-brand-navy">Review</h3>
                <FormField label="Status">
                  <select className={inputClass} value={editStatus} onChange={(e) => setEditStatus(e.target.value as ResumeStatus)}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Admin Notes">
                  <textarea className={inputClass} rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Internal notes about this candidate..." />
                </FormField>
                <Button onClick={saveReview} disabled={saving} className="w-full sm:w-auto">
                  {saving ? "Saving..." : "Save Review"}
                </Button>
              </div>
              </div>
            )}
          </AdminDetailPanel>
        )}
      </div>
    </div>
  );
}
