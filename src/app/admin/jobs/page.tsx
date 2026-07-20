"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, MapPin, Pencil, Plus, Trash2, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FormField, inputClass } from "@/components/admin/AdminForm";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { EMPLOYMENT_TYPE_LABELS, splitJobLines, type EmploymentTypeValue } from "@/lib/jobs";
import { getJobCategoryLabel, JOB_CATEGORIES } from "@/lib/resume";

type JobPosting = {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string | null;
  employmentType: EmploymentTypeValue;
  summary: string | null;
  description: string;
  requirements: string | null;
  isActive: boolean;
  _count: { applications: number };
};

const EMPTY_FORM = {
  title: "",
  slug: "",
  department: "SALES",
  location: "",
  employmentType: "FULL_TIME" as EmploymentTypeValue,
  summary: "",
  description: "",
  requirements: "",
  isActive: true,
};

function jobToForm(job: JobPosting) {
  return {
    title: job.title,
    slug: job.slug,
    department: job.department,
    location: job.location || "",
    employmentType: job.employmentType,
    summary: job.summary || "",
    description: job.description,
    requirements: job.requirements || "",
    isActive: job.isActive,
  };
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"empty" | "create" | "view" | "edit">("empty");
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { confirm } = useConfirmDialog();

  const selected = useMemo(
    () => jobs.find((job) => job.id === selectedId) ?? null,
    [jobs, selectedId]
  );

  const loadJobs = async () => {
    const response = await fetch("/api/admin/jobs");
    if (response.ok) setJobs(await response.json());
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const openCreate = () => {
    setSelectedId(null);
    setForm(EMPTY_FORM);
    setError("");
    setMode("create");
  };

  const openView = (job: JobPosting) => {
    setSelectedId(job.id);
    setError("");
    setMode("view");
  };

  const openEdit = (job: JobPosting) => {
    setSelectedId(job.id);
    setForm(jobToForm(job));
    setError("");
    setMode("edit");
  };

  const saveJob = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const isEditing = mode === "edit" && selected;
    const response = await fetch(isEditing ? `/api/admin/jobs/${selected.id}` : "/api/admin/jobs", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Unable to save the job posting.");
      return;
    }
    await loadJobs();
    setSelectedId(data.id);
    setForm(jobToForm(data));
    setMode("view");
  };

  const deleteJob = async (job: JobPosting) => {
    const ok = await confirm({
      title: "Delete job posting",
      message: `Delete "${job.title}"? Existing applications will remain in the resume list.`,
    });
    if (!ok) return;
    const response = await fetch(`/api/admin/jobs/${job.id}`, { method: "DELETE" });
    if (response.ok) {
      if (selectedId === job.id) {
        setSelectedId(null);
        setMode("empty");
      }
      await loadJobs();
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Job Postings"
        action={
          <Button type="button" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            New Job
          </Button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)] gap-6">
        <div className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-brand-gray/70 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-brand-navy">Job Title</th>
                <th className="px-4 py-3 text-left font-medium text-brand-navy">Department</th>
                <th className="px-4 py-3 text-left font-medium text-brand-navy">Type</th>
                <th className="px-4 py-3 text-left font-medium text-brand-navy">Location</th>
                <th className="px-4 py-3 text-center font-medium text-brand-navy">Applications</th>
                <th className="px-4 py-3 text-left font-medium text-brand-navy">Status</th>
                <th className="px-4 py-3 text-right font-medium text-brand-navy">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  onClick={() => openView(job)}
                  className={`border-b border-gray-100 cursor-pointer transition-colors last:border-0 ${
                    selectedId === job.id ? "bg-brand-accent/10" : "hover:bg-brand-gray/40"
                  }`}
                >
                  <td className="px-4 py-4">
                    <p className="font-medium text-brand-navy">{job.title}</p>
                    <p className="text-xs text-brand-silver mt-1 line-clamp-1">{job.summary || job.description}</p>
                  </td>
                  <td className="px-4 py-4 text-brand-dark">{getJobCategoryLabel(job.department)}</td>
                  <td className="px-4 py-4 text-brand-dark">{EMPLOYMENT_TYPE_LABELS[job.employmentType]}</td>
                  <td className="px-4 py-4 text-brand-silver">{job.location || "—"}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-brand-dark">
                      <Users className="w-3.5 h-3.5 text-brand-silver" />
                      {job._count.applications}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${
                      job.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {job.isActive ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => openEdit(job)} className="p-2 text-brand-deep hover:bg-brand-gray rounded-sm" aria-label="Edit job">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => deleteJob(job)} className="p-2 text-red-500 hover:bg-red-50 rounded-sm" aria-label="Delete job">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-brand-silver">
                    <BriefcaseBusiness className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    No job postings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <aside className="bg-white border border-gray-100 rounded-sm p-5 md:p-6 xl:sticky xl:top-6 xl:self-start">
          {mode === "empty" && (
            <div className="py-16 text-center text-brand-silver">
              <BriefcaseBusiness className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium text-brand-navy">Select a job posting</p>
              <p className="text-sm mt-1">Click a row to view its details.</p>
            </div>
          )}

          {mode === "view" && selected && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-brand-accent">Job Details</p>
                  <h2 className="text-xl font-semibold text-brand-navy mt-1">{selected.title}</h2>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selected.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {selected.isActive ? "Published" : "Draft"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-brand-silver">Department</p>
                  <p className="font-medium text-brand-dark mt-1">{getJobCategoryLabel(selected.department)}</p>
                </div>
                <div>
                  <p className="text-brand-silver">Employment Type</p>
                  <p className="font-medium text-brand-dark mt-1">{EMPLOYMENT_TYPE_LABELS[selected.employmentType]}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-brand-silver">Location</p>
                  <p className="font-medium text-brand-dark mt-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {selected.location || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-brand-silver">Applications</p>
                  <p className="font-medium text-brand-dark mt-1">{selected._count.applications}</p>
                </div>
                <div>
                  <p className="text-brand-silver">URL Slug</p>
                  <p className="font-medium text-brand-dark mt-1 break-all">{selected.slug}</p>
                </div>
              </div>

              {selected.summary && (
                <div>
                  <h3 className="text-sm font-semibold text-brand-navy mb-2">Short Summary</h3>
                  <p className="text-sm text-brand-dark whitespace-pre-wrap">{selected.summary}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-brand-navy mb-2">Description</h3>
                <p className="text-sm text-brand-dark whitespace-pre-wrap">{selected.description}</p>
              </div>
              {selected.requirements && (
                <div>
                  <h3 className="text-sm font-semibold text-brand-navy mb-2">Requirements</h3>
                  <ul className="space-y-2 text-sm text-brand-dark">
                    {splitJobLines(selected.requirements).map((requirement) => (
                      <li key={requirement} className="flex gap-2">
                        <span className="text-brand-accent">•</span>
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button type="button" onClick={() => openEdit(selected)} className="flex-1">
                  <Pencil className="w-4 h-4" />
                  Edit Job
                </Button>
                <Button type="button" variant="ghost" onClick={() => deleteJob(selected)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {(mode === "create" || mode === "edit") && (
            <form onSubmit={saveJob} className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-brand-accent">Careers</p>
                <h2 className="text-lg font-semibold text-brand-navy mt-1">
                  {mode === "edit" ? "Edit Job Posting" : "Create Job Posting"}
                </h2>
              </div>
              {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-sm">{error}</p>}
              <FormField label="Job title">
                <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </FormField>
              <FormField label="URL slug">
                <input className={inputClass} placeholder="Generated automatically" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Department">
                  <select className={inputClass} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                    {JOB_CATEGORIES.filter((category) => category.value !== "CUSTOM").map((category) => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Employment type">
                  <select className={inputClass} value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value as EmploymentTypeValue })}>
                    {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </FormField>
              </div>
              <FormField label="Location">
                <input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </FormField>
              <FormField label="Short summary">
                <textarea className={inputClass} rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
              </FormField>
              <FormField label="Description">
                <textarea required className={inputClass} rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </FormField>
              <FormField label="Requirements (one per line)">
                <textarea className={inputClass} rows={5} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
              </FormField>
              <label className="flex items-center gap-2 text-sm text-brand-dark">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Publish this job on the careers page
              </label>
              <div className="flex gap-3">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Job"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setMode(selected ? "view" : "empty")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
