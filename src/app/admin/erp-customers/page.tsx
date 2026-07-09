"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Database, Plus, Search, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BulkImportModal } from "@/components/admin/BulkImportModal";
import { ERP_CUSTOMER_IMPORT_TEMPLATE } from "@/lib/erp-customer-samples";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";

type ErpRecord = {
  id: string;
  erpCustomerNumber: string;
  phoneRaw: string | null;
  phoneNormalized: string;
  customerName: string | null;
  company: string | null;
  email: string | null;
  gstNo: string | null;
  panNo: string | null;
  state: string | null;
  address: string | null;
  others: string | null;
  erpStatus: string | null;
  linkedUser: {
    name: string;
    email: string;
    isActive: boolean;
    membershipTier: string;
  } | null;
};

type EditableFields = {
  customerName: string;
  gstNo: string;
  panNo: string;
  state: string;
  email: string;
  phone: string;
  address: string;
  others: string;
  erpStatus: string;
};

type RowDraft = EditableFields & { id: string; erpCustomerNumber: string; isNew?: boolean };

type DataColumnKey =
  | "customerName"
  | "gstNo"
  | "panNo"
  | "state"
  | "email"
  | "phone"
  | "address"
  | "others"
  | "status";

type SortKey = DataColumnKey;
type ColumnWidthKey = DataColumnKey | "select" | "no" | "actions";

const SORT_COLUMNS: { key: DataColumnKey; label: string }[] = [
  { key: "customerName", label: "Customer Name" },
  { key: "gstNo", label: "GST No." },
  { key: "panNo", label: "PAN No." },
  { key: "state", label: "State" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "others", label: "Other" },
  { key: "status", label: "Status" },
];

const COLUMN_WIDTH_STORAGE_KEY = "dentium-erp-column-widths";

const DEFAULT_COLUMN_WIDTHS: Record<ColumnWidthKey, number> = {
  select: 44,
  no: 52,
  customerName: 180,
  gstNo: 120,
  panNo: 120,
  state: 100,
  email: 150,
  phone: 130,
  address: 280,
  others: 72,
  status: 130,
  actions: 88,
};

const tdCellClass = "px-1.5 py-1.5 border-r border-gray-200 overflow-hidden";

const EMPTY_DRAFT: EditableFields = {
  customerName: "",
  gstNo: "",
  panNo: "",
  state: "",
  email: "",
  phone: "",
  address: "",
  others: "",
  erpStatus: "Not Available",
};

const cellClass =
  "w-full min-w-0 px-2 py-1.5 border border-gray-200/80 hover:border-brand-deep/40 focus:border-brand-deep focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-deep/20 bg-white/60 rounded-sm text-sm text-brand-dark";

function recordToDraft(record: ErpRecord): RowDraft {
  return {
    id: record.id,
    erpCustomerNumber: record.erpCustomerNumber,
    customerName: record.customerName || "",
    gstNo: record.gstNo || "",
    panNo: record.panNo || "",
    state: record.state || "",
    email: record.email || "",
    phone: record.phoneRaw || record.phoneNormalized || "",
    address: record.address || "",
    others: record.others || "",
    erpStatus: record.erpStatus || "",
  };
}

function memberStatus(record: ErpRecord) {
  if (!record.linkedUser) return record.erpStatus || "Not Available";
  if (!record.linkedUser.isActive) return "Pending signup approval";
  return record.linkedUser.membershipTier === "FULL" ? "Full Member" : "Associate Member";
}

function sortValue(record: ErpRecord, key: SortKey): string {
  if (key === "status") return memberStatus(record);
  if (key === "phone") return record.phoneRaw || record.phoneNormalized || "";
  return (record[key] as string | null) || "";
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  sortDir,
  onSort,
  width,
  onResizeStart,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey | null;
  sortDir: "asc" | "desc";
  onSort: (key: SortKey) => void;
  width: number;
  onResizeStart: (key: ColumnWidthKey, e: React.MouseEvent) => void;
}) {
  const active = activeKey === sortKey;
  const Icon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <th
      style={{ width, minWidth: width, maxWidth: width }}
      className="relative border-r border-white/15 p-0"
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`flex h-full w-full items-center gap-1.5 px-3 py-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wide transition-colors ${
          active ? "text-brand-accent" : "text-white hover:text-brand-accent"
        }`}
      >
        <span className="truncate">{label}</span>
        <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "opacity-100" : "opacity-50"}`} />
      </button>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={`Resize ${label} column`}
        onMouseDown={(e) => onResizeStart(sortKey, e)}
        className="absolute right-0 top-0 z-20 h-full w-2 cursor-col-resize touch-none hover:bg-brand-accent/70 active:bg-brand-accent"
      />
    </th>
  );
}

function useColumnWidths() {
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
  const widthsRef = useRef(columnWidths);
  const resizingRef = useRef<{ key: ColumnWidthKey; startX: number; startWidth: number } | null>(null);

  widthsRef.current = columnWidths;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COLUMN_WIDTH_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Partial<Record<ColumnWidthKey, number>>;
      setColumnWidths((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore invalid saved widths
    }
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const resizing = resizingRef.current;
      if (!resizing) return;
      const next = Math.max(56, resizing.startWidth + (e.clientX - resizing.startX));
      setColumnWidths((prev) => ({ ...prev, [resizing.key]: next }));
    };

    const onUp = () => {
      if (!resizingRef.current) return;
      resizingRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      localStorage.setItem(COLUMN_WIDTH_STORAGE_KEY, JSON.stringify(widthsRef.current));
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const startResize = useCallback((key: ColumnWidthKey, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizingRef.current = {
      key,
      startX: e.clientX,
      startWidth: widthsRef.current[key],
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const resetWidths = useCallback(() => {
    setColumnWidths(DEFAULT_COLUMN_WIDTHS);
    localStorage.removeItem(COLUMN_WIDTH_STORAGE_KEY);
  }, []);

  return { columnWidths, startResize, resetWidths };
}

function EditableCell({
  value,
  onChange,
  onSave,
  multiline,
  mono,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  multiline?: boolean;
  mono?: boolean;
}) {
  const shared = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    onBlur: onSave,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (!multiline && e.key === "Enter") {
        e.preventDefault();
        (e.target as HTMLInputElement).blur();
      }
    },
    className: `${cellClass}${mono ? " font-mono text-xs" : ""}`,
  };

  if (multiline) {
    return <textarea {...shared} rows={2} className={`${shared.className} resize-y min-h-[52px]`} />;
  }
  return <input type="text" {...shared} />;
}

export default function AdminErpCustomersPage() {
  const [bulkOpen, setBulkOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [filtered, setFiltered] = useState(0);
  const [records, setRecords] = useState<ErpRecord[]>([]);
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<RowDraft | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>("customerName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { columnWidths, startResize, resetWidths } = useColumnWidths();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);
  const { showAlert, confirm } = useConfirmDialog();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const fetchData = useCallback(() => {
    const params = debouncedSearch ? `?q=${encodeURIComponent(debouncedSearch)}` : "";
    fetch(`/api/admin/erp-customers${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setTotal(data.total ?? 0);
        setFiltered(data.filtered ?? data.total ?? 0);
        const list: ErpRecord[] = data.records ?? [];
        setRecords(list);
        setDrafts(Object.fromEntries(list.map((r) => [r.id, recordToDraft(r)])));
        setSelectedIds((prev) => {
          const valid = new Set(list.map((r) => r.id));
          return new Set([...prev].filter((id) => valid.has(id)));
        });
      });
  }, [debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateDraft = (id: string, field: keyof EditableFields, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveRow = async (id: string) => {
    const draft = drafts[id];
    if (!draft) return;

    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/erp-customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: draft.customerName,
          gstNo: draft.gstNo,
          panNo: draft.panNo,
          state: draft.state,
          email: draft.email,
          phone: draft.phone,
          address: draft.address,
          others: draft.others,
          erpStatus: draft.erpStatus,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        await showAlert({
          variant: data.duplicate ? "warning" : "error",
          title: data.duplicate ? "Duplicate record" : "Save failed",
          message: data.error || "Could not save changes.",
        });
        return;
      }
      fetchData();
    } finally {
      setSavingId(null);
    }
  };

  const addNewRow = () => {
    setNewRow({ id: "__new__", erpCustomerNumber: "", isNew: true, ...EMPTY_DRAFT });
  };

  const saveNewRow = async () => {
    if (!newRow) return;
    if (!newRow.customerName.trim() || !newRow.phone.trim()) {
      await showAlert({ variant: "warning", message: "Customer name and phone are required." });
      return;
    }

    setSavingId("__new__");
    try {
      const res = await fetch("/api/admin/erp-customers/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRow),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        await showAlert({
          variant: data.duplicate ? "warning" : "error",
          title: data.duplicate ? "Duplicate record" : "Could not add row",
          message: data.error || "Failed to create record.",
        });
        return;
      }
      setNewRow(null);
      fetchData();
    } finally {
      setSavingId(null);
    }
  };

  const clearAllRecords = async () => {
    const ok = await confirm({
      title: "Delete all ERP customers",
      message: `Delete all ${total.toLocaleString()} records? This cannot be undone.`,
      confirmLabel: "Delete all",
    });
    if (!ok) return;

    const res = await fetch("/api/admin/erp-customers", { method: "DELETE" });
    if (!res.ok) {
      await showAlert({ variant: "error", message: "Failed to delete all records." });
      return;
    }
    setSelectedIds(new Set());
    fetchData();
  };

  const deleteSelected = async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;

    const ok = await confirm({
      title: "Delete selected ERP customers",
      message: `Delete ${ids.length.toLocaleString()} selected record(s)? This cannot be undone.`,
      confirmLabel: "Delete selected",
    });
    if (!ok) return;

    const res = await fetch("/api/admin/erp-customers/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      await showAlert({ variant: "error", message: data.error || "Failed to delete selected records." });
      return;
    }
    setSelectedIds(new Set());
    fetchData();
  };

  const loadSampleData = async () => {
    const res = await fetch("/api/admin/erp-customers/samples", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      await showAlert({ variant: "error", message: data.error || "Failed to load sample data." });
      return;
    }
    fetchData();
  };

  const resultLabel = useMemo(() => {
    if (debouncedSearch) return `${filtered.toLocaleString()} of ${total.toLocaleString()} records`;
    return `${total.toLocaleString()} records`;
  }, [debouncedSearch, filtered, total]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedRecords = useMemo(() => {
    if (!sortKey) return records;
    return [...records].sort((a, b) => {
      const cmp = sortValue(a, sortKey).localeCompare(sortValue(b, sortKey), undefined, {
        sensitivity: "base",
        numeric: true,
      });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [records, sortKey, sortDir]);

  const visibleIds = useMemo(() => sortedRecords.map((r) => r.id), [sortedRecords]);
  const selectedCount = useMemo(
    () => visibleIds.filter((id) => selectedIds.has(id)).length,
    [visibleIds, selectedIds]
  );
  const allVisibleSelected = visibleIds.length > 0 && selectedCount === visibleIds.length;
  const someVisibleSelected = selectedCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected, selectedCount]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const renderEditableRow = (draft: RowDraft, record?: ErpRecord, rowIndex = 0) => {
    const id = draft.id;
    const isSaving = savingId === id;
    const rowNumber = record ? rowIndex + 1 : null;

    return (
      <tr
        key={id}
        className={`align-top border-b border-gray-200 transition-colors ${
          isSaving ? "opacity-60" : ""
        } ${rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-brand-accent/10 ${
          record && selectedIds.has(record.id) ? "bg-brand-accent/15" : ""
        }`}
      >
        <td className={`${tdCellClass} text-center`}>
          {record ? (
            <input
              type="checkbox"
              checked={selectedIds.has(record.id)}
              onChange={() => toggleSelect(record.id)}
              aria-label={`Select ${record.customerName || record.erpCustomerNumber}`}
              className="h-4 w-4 accent-brand-deep cursor-pointer"
            />
          ) : null}
        </td>
        <td className={`${tdCellClass} text-center text-brand-silver text-xs font-medium tabular-nums`}>
          {rowNumber ?? "—"}
        </td>
        <td className={tdCellClass}>
          <EditableCell
            value={draft.customerName}
            onChange={(v) => (record ? updateDraft(id, "customerName", v) : setNewRow((r) => (r ? { ...r, customerName: v } : r)))}
            onSave={() => (record ? saveRow(id) : undefined)}
          />
        </td>
        <td className={tdCellClass}>
          <EditableCell
            value={draft.gstNo}
            mono
            onChange={(v) => (record ? updateDraft(id, "gstNo", v) : setNewRow((r) => (r ? { ...r, gstNo: v } : r)))}
            onSave={() => (record ? saveRow(id) : undefined)}
          />
        </td>
        <td className={tdCellClass}>
          <EditableCell
            value={draft.panNo}
            mono
            onChange={(v) => (record ? updateDraft(id, "panNo", v) : setNewRow((r) => (r ? { ...r, panNo: v } : r)))}
            onSave={() => (record ? saveRow(id) : undefined)}
          />
        </td>
        <td className={tdCellClass}>
          <EditableCell
            value={draft.state}
            onChange={(v) => (record ? updateDraft(id, "state", v) : setNewRow((r) => (r ? { ...r, state: v } : r)))}
            onSave={() => (record ? saveRow(id) : undefined)}
          />
        </td>
        <td className={tdCellClass}>
          <EditableCell
            value={draft.email}
            onChange={(v) => (record ? updateDraft(id, "email", v) : setNewRow((r) => (r ? { ...r, email: v } : r)))}
            onSave={() => (record ? saveRow(id) : undefined)}
          />
        </td>
        <td className={tdCellClass}>
          <EditableCell
            value={draft.phone}
            onChange={(v) => (record ? updateDraft(id, "phone", v) : setNewRow((r) => (r ? { ...r, phone: v } : r)))}
            onSave={() => (record ? saveRow(id) : undefined)}
          />
        </td>
        <td className={tdCellClass}>
          <EditableCell
            value={draft.address}
            multiline
            onChange={(v) => (record ? updateDraft(id, "address", v) : setNewRow((r) => (r ? { ...r, address: v } : r)))}
            onSave={() => (record ? saveRow(id) : undefined)}
          />
        </td>
        <td className={tdCellClass}>
          <EditableCell
            value={draft.others}
            onChange={(v) => (record ? updateDraft(id, "others", v) : setNewRow((r) => (r ? { ...r, others: v } : r)))}
            onSave={() => (record ? saveRow(id) : undefined)}
          />
        </td>
        <td className={tdCellClass}>
          {record ? (
            <span
              className={`block px-2 py-1.5 text-sm ${
                record.linkedUser?.isActive ? "text-brand-deep font-medium" : "text-brand-silver"
              }`}
              title="Linked member status (read-only)"
            >
              {memberStatus(record)}
            </span>
          ) : (
            <EditableCell
              value={draft.erpStatus}
              onChange={(v) => setNewRow((r) => (r ? { ...r, erpStatus: v } : r))}
              onSave={saveNewRow}
            />
          )}
        </td>
        <td className="px-2 py-1.5 overflow-hidden">
          {!record && (
            <div className="flex gap-1">
              <Button type="button" size="sm" onClick={saveNewRow} disabled={savingId === "__new__"}>
                Save
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setNewRow(null)}>
                Cancel
              </Button>
            </div>
          )}
        </td>
      </tr>
    );
  };

  const tableMinWidth = useMemo(
    () => Object.values(columnWidths).reduce((sum, w) => sum + w, 0),
    [columnWidths]
  );

  return (
    <div>
      <AdminPageHeader
        title="ERP Customers"
        description="Edit cells like a spreadsheet — changes save when you leave a field. Phone numbers match members at signup."
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={addNewRow}>
              <Plus className="w-4 h-4" /> Add row
            </Button>
            {total > 0 && (
              <Button type="button" variant="secondary" onClick={clearAllRecords}>
                <Trash2 className="w-4 h-4" /> Clear all
              </Button>
            )}
            {total === 0 && (
              <Button type="button" variant="secondary" onClick={loadSampleData}>
                Load sample list
              </Button>
            )}
            <Button type="button" onClick={() => setBulkOpen(true)}>
              <Upload className="w-4 h-4" /> Import from ERP
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-sm shadow-sm">
          <div className="flex items-center gap-2 text-brand-silver text-sm mb-1">
            <Database className="w-4 h-4" /> Total records
          </div>
          <p className="text-2xl font-semibold text-brand-navy">{resultLabel}</p>
        </div>
      </div>

      <div className="bg-white rounded-sm shadow-md border border-gray-200 overflow-hidden mb-8">
        <div className="px-4 py-3 border-b border-gray-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-semibold text-brand-navy">ERP Customer List</h3>
            {selectedCount > 0 && (
              <Button type="button" variant="secondary" size="sm" onClick={deleteSelected}>
                <Trash2 className="w-4 h-4" />
                Delete selected ({selectedCount})
              </Button>
            )}
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, GST, PAN, phone, email, address..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 bg-white rounded-sm text-sm focus:outline-none focus:border-brand-deep focus:ring-1 focus:ring-brand-deep/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto bg-white">
          <table
            className="w-full text-sm border-collapse table-fixed"
            style={{ minWidth: tableMinWidth }}
          >
            <colgroup>
              <col style={{ width: columnWidths.select }} />
              <col style={{ width: columnWidths.no }} />
              {SORT_COLUMNS.map((col) => (
                <col key={col.key} style={{ width: columnWidths[col.key] }} />
              ))}
              <col style={{ width: columnWidths.actions }} />
            </colgroup>
            <thead className="bg-brand-navy text-left sticky top-0 z-10">
              <tr>
                <th
                  style={{
                    width: columnWidths.select,
                    minWidth: columnWidths.select,
                    maxWidth: columnWidths.select,
                  }}
                  className="border-r border-white/15 p-0 text-center"
                >
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    disabled={visibleIds.length === 0}
                    aria-label="Select all visible rows"
                    className="h-4 w-4 accent-brand-accent cursor-pointer disabled:opacity-40"
                  />
                </th>
                <th
                  style={{
                    width: columnWidths.no,
                    minWidth: columnWidths.no,
                    maxWidth: columnWidths.no,
                  }}
                  className="relative border-r border-white/15 p-0 text-center"
                >
                  <span className="block px-2 py-2.5 text-xs font-semibold uppercase tracking-wide text-white/90">
                    No.
                  </span>
                  <div
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Resize No. column"
                    onMouseDown={(e) => startResize("no", e)}
                    className="absolute right-0 top-0 z-20 h-full w-2 cursor-col-resize touch-none hover:bg-brand-accent/70 active:bg-brand-accent"
                  />
                </th>
                {SORT_COLUMNS.map((col) => (
                  <SortableHeader
                    key={col.key}
                    label={col.label}
                    sortKey={col.key}
                    activeKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggleSort}
                    width={columnWidths[col.key]}
                    onResizeStart={startResize}
                  />
                ))}
                <th
                  style={{
                    width: columnWidths.actions,
                    minWidth: columnWidths.actions,
                    maxWidth: columnWidths.actions,
                  }}
                  className="relative px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-white/70"
                >
                  Actions
                  <div
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Resize Actions column"
                    onMouseDown={(e) => startResize("actions", e)}
                    className="absolute right-0 top-0 z-20 h-full w-2 cursor-col-resize touch-none hover:bg-brand-accent/70 active:bg-brand-accent"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map((r, index) => drafts[r.id] && renderEditableRow(drafts[r.id], r, index))}
              {newRow && renderEditableRow(newRow, undefined, sortedRecords.length)}
              {sortedRecords.length === 0 && !newRow && (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-brand-silver border-t border-gray-200">
                    {debouncedSearch ? "No records match your search." : "No ERP customer records yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="px-4 py-2.5 text-xs text-brand-silver border-t border-gray-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <span>
            Drag column edges to resize. Click a header to sort. Select rows with checkboxes, then delete.
          </span>
          <button
            type="button"
            onClick={resetWidths}
            className="text-brand-deep hover:underline shrink-0"
          >
            Reset column widths
          </button>
        </p>
      </div>

      <BulkImportModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Import ERP Customers"
        description="Upload Excel (.xlsx) or CSV from your ERP. Duplicate rows update existing records and are reported."
        templateFilename="erp-customers-template.csv"
        templateContent={ERP_CUSTOMER_IMPORT_TEMPLATE}
        columnsHelp="Required: Customer Name, Phone. Optional: GST No., PAN No., State, Email, Address, Other, Status."
        importEndpoint="/api/admin/erp-customers"
        acceptExcel
        onComplete={fetchData}
      />
    </div>
  );
}
