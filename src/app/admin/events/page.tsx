"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, CalendarClock, CalendarX, Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/admin/DataTable";
import { AdminInlineForm, FormField, inputClass } from "@/components/admin/AdminForm";
import { AdminDetailPanel, AdminPageHeader, AdminPanelBreadcrumb } from "@/components/admin/AdminPageHeader";
import { DetailField } from "@/components/admin/AdminDetailFields";
import { AdminListDetailGrid } from "@/components/admin/AdminListDetailGrid";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FeaturedImageField } from "@/components/admin/ImageUploadField";
import { useAdminListPanel } from "@/hooks/useAdminListPanel";
import { ADMIN_PANEL_CLASS, buildAdminBreadcrumbItems } from "@/lib/admin-panel";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  description: string;
  excerpt: string | null;
  location: string | null;
  venue: string | null;
  startDate: string;
  endDate: string | null;
  status: string;
  featuredImage: string | null;
  isFeatured: boolean;
  registrationUrl: string | null;
}

const EMPTY_FORM = {
  title: "", description: "", excerpt: "", location: "", venue: "",
  startDate: "", endDate: "", status: "UPCOMING", featuredImage: "",
  isFeatured: false, registrationUrl: "",
};

function toDateInputValue(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function eventToForm(e: Event) {
  return {
    title: e.title ?? "",
    description: e.description ?? "",
    excerpt: e.excerpt ?? "",
    location: e.location ?? "",
    venue: e.venue ?? "",
    startDate: toDateInputValue(e.startDate),
    endDate: toDateInputValue(e.endDate),
    status: e.status ?? "UPCOMING",
    featuredImage: e.featuredImage ?? "",
    isFeatured: e.isFeatured ?? false,
    registrationUrl: e.registrationUrl ?? "",
  };
}

const STATUS_LABELS: Record<string, string> = {
  UPCOMING: "Upcoming",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function EventDetailView({ item }: { item: Event }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailField label="Status">{STATUS_LABELS[item.status] ?? item.status}</DetailField>
        <DetailField label="Start Date">{formatDate(item.startDate)}</DetailField>
        <DetailField label="End Date">{formatDate(item.endDate)}</DetailField>
        <DetailField label="Location">{item.location || "—"}</DetailField>
        <DetailField label="Venue">{item.venue || "—"}</DetailField>
        {item.registrationUrl && (
          <DetailField label="Registration URL" className="sm:col-span-2">
            <span className="break-all text-sm">{item.registrationUrl}</span>
          </DetailField>
        )}
      </div>
      {item.excerpt && (
        <DetailField label="Excerpt">{item.excerpt}</DetailField>
      )}
      {item.description && (
        <DetailField label="Description">
          <span className="whitespace-pre-wrap">{item.description}</span>
        </DetailField>
      )}
      {item.featuredImage && (
        <DetailField label="Featured Image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.featuredImage} alt={item.title} className="mt-2 max-h-48 rounded-sm border border-gray-200 object-cover" />
        </DetailField>
      )}
    </div>
  );
}

function EventFormFields({
  form,
  setForm,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
}) {
  return (
    <>
      <FormField label="Title">
        <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </FormField>
      <FormField label="Excerpt">
        <input className={inputClass} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
      </FormField>
      <FormField label="Description">
        <textarea className={inputClass} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Location">
          <input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </FormField>
        <FormField label="Venue">
          <input className={inputClass} value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Start Date">
          <input type="date" required className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        </FormField>
        <FormField label="End Date">
          <input type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        </FormField>
      </div>
      <FormField label="Status">
        <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="UPCOMING">Upcoming</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </FormField>
      <FormField label="Featured Image">
        <FeaturedImageField
          value={form.featuredImage}
          onChange={(featuredImage) => setForm({ ...form, featuredImage })}
          hint="Shown on event cards and detail page"
        />
      </FormField>
      <FormField label="Registration URL">
        <input className={inputClass} value={form.registrationUrl} onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })} />
      </FormField>
    </>
  );
}

type StatusFilter = "all" | "upcoming" | "completed" | "cancelled";

const STATUS_TABS: { key: StatusFilter; label: string; icon: typeof Layers }[] = [
  { key: "all", label: "All", icon: Layers },
  { key: "upcoming", label: "Upcoming", icon: CalendarClock },
  { key: "completed", label: "Completed", icon: CalendarCheck },
  { key: "cancelled", label: "Cancelled", icon: CalendarX },
];

function matchesStatusFilter(status: string, filter: StatusFilter): boolean {
  if (filter === "all") return true;
  if (filter === "upcoming") return status === "UPCOMING" || status === "ONGOING";
  if (filter === "completed") return status === "COMPLETED";
  return status === "CANCELLED";
}

function defaultStatusForFilter(filter: StatusFilter): string {
  if (filter === "completed") return "COMPLETED";
  if (filter === "cancelled") return "CANCELLED";
  return "UPCOMING";
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { confirm, ConfirmDialogHost } = useConfirmDialog();
  const panel = useAdminListPanel<Event>();

  const fetchData = async () => {
    const res = await fetch("/api/admin/events");
    if (res.ok) setEvents(await res.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEvents = useMemo(
    () => events.filter((event) => matchesStatusFilter(event.status, statusFilter)),
    [events, statusFilter]
  );

  const statusCounts = useMemo(
    () => ({
      all: events.length,
      upcoming: events.filter((event) => matchesStatusFilter(event.status, "upcoming")).length,
      completed: events.filter((event) => event.status === "COMPLETED").length,
      cancelled: events.filter((event) => event.status === "CANCELLED").length,
    }),
    [events]
  );

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, status: defaultStatusForFilter(statusFilter) });
    panel.openCreate();
  };

  const openEditFromDetail = () => {
    if (!panel.selected) return;
    setForm(eventToForm(panel.selected));
    panel.openEdit();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const editing = panel.panelMode === "edit" ? panel.selected : null;
    const url = editing ? `/api/admin/events/${editing.id}` : "/api/admin/events";
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to save event");
      return;
    }

    const saved = await res.json();
    await fetchData();

    if (panel.panelMode === "edit") {
      panel.setSelected(saved);
      panel.backToView();
      return;
    }

    panel.closePanel();
  };

  const handleDelete = async (event: Event) => {
    const ok = await confirm({
      title: "Delete event",
      message: `"${event.title}" will be permanently deleted. This action cannot be undone.`,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/events/${event.id}`, { method: "DELETE" });
    if (res.ok) {
      if (panel.selected?.id === event.id) panel.closePanel();
      fetchData();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to delete event");
    }
  };

  const itemLabel = panel.selected?.title ?? "Details";
  const breadcrumbItems = buildAdminBreadcrumbItems(
    "Events",
    panel.panelMode,
    panel.panelMode !== "create" ? itemLabel : undefined,
    "Add Event"
  );

  return (
    <div>
      <AdminPageHeader
        title="Events"
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Event
          </Button>
        }
      />

      <div className="flex flex-wrap border-b border-gray-200 mb-4">
        {STATUS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = statusFilter === tab.key;
          const count = statusCounts[tab.key];

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-brand-accent text-brand-navy"
                  : "border-transparent text-brand-silver hover:text-brand-navy"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={cn("text-xs tabular-nums", isActive ? "text-brand-deep" : "text-brand-silver/80")}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      <AdminListDetailGrid
        showSidePanel={panel.showSidePanel}
        list={
          <DataTable
            columns={[
              { key: "title", label: "Title" },
              { key: "location", label: "Location", render: (e) => e.location || "—" },
              ...(statusFilter === "all"
                ? [
                    {
                      key: "status" as const,
                      label: "Status",
                      render: (e: Event) => STATUS_LABELS[e.status] ?? e.status,
                    },
                  ]
                : []),
              { key: "startDate", label: "Date", render: (e) => new Date(e.startDate).toLocaleDateString() },
            ]}
            data={filteredEvents}
            onEdit={panel.openView}
            onDelete={handleDelete}
            selectedRowId={panel.activeRowId}
          />
        }
        panel={
          <>
            {panel.panelMode === "view" && panel.selected && (
              <AdminDetailPanel
                title={panel.selected.title}
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                headerAction={
                  <Button type="button" size="sm" variant="secondary" onClick={openEditFromDetail}>
                    Edit
                  </Button>
                }
                onClose={panel.closePanel}
                className={ADMIN_PANEL_CLASS}
              >
                <EventDetailView item={panel.selected} />
              </AdminDetailPanel>
            )}

            {panel.panelMode === "edit" && panel.selected && (
              <AdminInlineForm
                title="Edit Event"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                cancelLabel="Back to details"
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                className={ADMIN_PANEL_CLASS}
              >
                <EventFormFields form={form} setForm={setForm} />
              </AdminInlineForm>
            )}

            {panel.panelMode === "create" && (
              <AdminInlineForm
                title="Add Event"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                className={ADMIN_PANEL_CLASS}
              >
                <EventFormFields form={form} setForm={setForm} />
              </AdminInlineForm>
            )}
          </>
        }
      />

      <ConfirmDialogHost />
    </div>
  );
}
