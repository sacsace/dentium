"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/admin/DataTable";
import { AdminForm, FormField, inputClass } from "@/components/admin/AdminForm";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";

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

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { confirm, ConfirmDialogHost } = useConfirmDialog();

  const fetchData = async () => {
    const res = await fetch("/api/admin/events");
    if (res.ok) setEvents(await res.json());
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (event: Event) => {
    setEditing(event);
    setForm(eventToForm(event));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = editing ? `/api/admin/events/${editing.id}` : "/api/admin/events";
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    if (res.ok) {
      setShowForm(false);
      setEditing(null);
      fetchData();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to save event");
    }
  };

  const handleDelete = async (event: Event) => {
    const ok = await confirm({
      title: "Delete event",
      message: `"${event.title}" will be permanently deleted. This action cannot be undone.`,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/events/${event.id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-brand-navy">Events</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Event</Button>
      </div>

      <DataTable
        columns={[
          { key: "title", label: "Title" },
          { key: "location", label: "Location" },
          { key: "status", label: "Status" },
          { key: "startDate", label: "Date", render: (e) => new Date(e.startDate).toLocaleDateString() },
        ]}
        data={events}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <AdminForm title={editing ? "Edit Event" : "Add Event"} onSubmit={handleSubmit} onClose={() => setShowForm(false)} loading={loading}>
          <FormField label="Title"><input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Excerpt"><input className={inputClass} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></FormField>
          <FormField label="Description"><textarea className={inputClass} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Location"><input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></FormField>
            <FormField label="Venue"><input className={inputClass} value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date"><input type="date" required className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></FormField>
            <FormField label="End Date"><input type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></FormField>
          </div>
          <FormField label="Status">
            <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="UPCOMING">Upcoming</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </FormField>
          <FormField label="Featured Image URL"><input className={inputClass} value={form.featuredImage} onChange={(e) => setForm({ ...form, featuredImage: e.target.value })} /></FormField>
          <FormField label="Registration URL"><input className={inputClass} value={form.registrationUrl} onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })} /></FormField>
        </AdminForm>
      )}
      <ConfirmDialogHost />
    </div>
  );
}
