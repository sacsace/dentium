"use client";

import { ChevronDown, ChevronUp, Search, Trash2 } from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  sortValue?: (item: T) => string | number | boolean | null | undefined;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  editLabel?: string;
  getEditLabel?: (item: T) => string;
  onDelete?: (item: T) => void;
  onRowClick?: (item: T) => void;
  selectedRowId?: string | null;
  /** Column key used as the card title on mobile */
  mobileTitleKey?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  sortable?: boolean;
  selectable?: boolean;
  onBulkDelete?: (items: T[]) => void | Promise<void>;
  bulkDeleteLabel?: string;
}

type SortDir = "asc" | "desc";

function cellValue<T>(item: T, col: Column<T>) {
  if (col.render) return col.render(item);
  return String((item as Record<string, unknown>)[col.key] ?? "");
}

function collectSearchText(value: unknown, depth = 0): string[] {
  if (value == null || depth > 2) return [];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return [String(value)];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectSearchText(entry, depth + 1));
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap((entry) =>
      collectSearchText(entry, depth + 1)
    );
  }
  return [];
}

function itemSearchText<T>(item: T, columns: Column<T>[]): string {
  const fromRow = collectSearchText(item).join(" ");
  const fromCells = columns
    .map((col) => {
      const rendered = cellValue(item, col);
      if (rendered == null || typeof rendered === "boolean") return String(rendered);
      if (typeof rendered === "string" || typeof rendered === "number") return String(rendered);
      return "";
    })
    .join(" ");

  return `${fromRow} ${fromCells}`.toLowerCase();
}

function getSortValue<T>(item: T, col: Column<T>): string {
  if (col.sortValue) return String(col.sortValue(item) ?? "");
  const raw = (item as Record<string, unknown>)[col.key];
  if (raw == null) return "";
  if (typeof raw === "object") {
    if ("name" in (raw as object)) return String((raw as { name?: unknown }).name ?? "");
    return "";
  }
  return String(raw);
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onEdit,
  editLabel = "Edit",
  getEditLabel,
  onDelete,
  onRowClick,
  selectedRowId,
  mobileTitleKey,
  searchable = true,
  searchPlaceholder = "Search...",
  sortable = true,
  selectable = false,
  onBulkDelete,
  bulkDeleteLabel = "Delete",
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: SortDir } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const titleKey = mobileTitleKey ?? columns[0]?.key;
  const actionLabel = (item: T) => getEditLabel?.(item) ?? editLabel;
  const rowClickHandler = onRowClick ?? (!getEditLabel && onEdit ? onEdit : undefined);
  const showEditAction = Boolean(onEdit && rowClickHandler !== onEdit);
  const rowClass = (item: T) =>
    cn(
      rowClickHandler && "cursor-pointer",
      selectedRowId === item.id ? "bg-brand-accent/10 hover:bg-brand-accent/15" : "hover:bg-brand-gray/50"
    );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((item) => itemSearchText(item, columns).includes(q));
  }, [columns, data, query]);

  const sorted = useMemo(() => {
    if (!sort || !sortable) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col || col.sortable === false) return filtered;

    return [...filtered].sort((a, b) => {
      const cmp = getSortValue(a, col).localeCompare(getSortValue(b, col), undefined, {
        numeric: true,
        sensitivity: "base",
      });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [columns, filtered, sort, sortable]);

  const toggleSort = (col: Column<T>) => {
    if (!sortable || col.sortable === false) return;
    setSort((prev) =>
      prev?.key === col.key
        ? { key: col.key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key: col.key, dir: "asc" }
    );
  };

  const visibleIds = useMemo(() => sorted.map((item) => item.id), [sorted]);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someVisibleSelected =
    visibleIds.some((id) => selectedIds.has(id)) && !allVisibleSelected;
  const selectedItems = useMemo(
    () => data.filter((item) => selectedIds.has(item.id)),
    [data, selectedIds]
  );

  useEffect(() => {
    const validIds = new Set(data.map((item) => item.id));
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [data]);

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

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedItems.length === 0 || bulkDeleting) return;
    setBulkDeleting(true);
    try {
      await onBulkDelete(selectedItems);
      setSelectedIds(new Set());
    } finally {
      setBulkDeleting(false);
    }
  };

  const selectionColSpan = selectable ? 1 : 0;
  const actionsColSpan = showEditAction || onDelete ? 1 : 0;

  return (
    <div className="bg-white rounded-sm shadow-sm overflow-hidden">
      {(searchable || (selectable && onBulkDelete)) && (
        <div className="p-4 border-b border-gray-100 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {searchable && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver pointer-events-none" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-sm text-sm text-brand-dark placeholder:text-brand-silver focus:outline-none focus:border-brand-deep"
                  aria-label="Search table"
                />
              </div>
            )}
            {selectable && onBulkDelete && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={selectedItems.length === 0 || bulkDeleting}
                onClick={handleBulkDelete}
                className="shrink-0 self-start sm:self-auto"
              >
                <Trash2 className="w-4 h-4" />
                {bulkDeleteLabel}
                {selectedItems.length > 0 && ` (${selectedItems.length})`}
              </Button>
            )}
          </div>
          {query.trim() && (
            <p className="text-xs text-brand-silver">
              {filtered.length} of {data.length} result{data.length === 1 ? "" : "s"}
            </p>
          )}
          {rowClickHandler && !query.trim() && (
            <p className="text-xs text-brand-silver">Click a row to view details</p>
          )}
        </div>
      )}

      {/* Mobile card list */}
      <div className="md:hidden divide-y divide-gray-100">
        {sorted.map((item) => (
          <div
            key={item.id}
            className={`p-4 space-y-2 ${rowClickHandler ? rowClass(item) : ""}`}
            onClick={rowClickHandler ? () => rowClickHandler(item) : undefined}
            onKeyDown={
              rowClickHandler
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      rowClickHandler(item);
                    }
                  }
                : undefined
            }
            role={rowClickHandler ? "button" : undefined}
            tabIndex={rowClickHandler ? 0 : undefined}
          >
            <div className="flex items-start gap-3">
              {selectable && (
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-0.5 shrink-0"
                  aria-label={`Select ${titleKey ? cellValue(item, columns.find((c) => c.key === titleKey) ?? columns[0]) : "row"}`}
                />
              )}
              {titleKey && (
                <p className="font-medium text-brand-navy text-sm pr-2 flex-1 min-w-0">
                  {cellValue(item, columns.find((c) => c.key === titleKey) ?? columns[0])}
                </p>
              )}
            </div>
            <dl className="space-y-1.5">
              {columns
                .filter((col) => col.key !== titleKey)
                .map((col) => (
                  <div key={col.key} className="flex items-start justify-between gap-3 text-sm">
                    <dt className="text-brand-silver text-xs shrink-0">{col.label}</dt>
                    <dd className="text-brand-dark text-right min-w-0 break-words">{cellValue(item, col)}</dd>
                  </div>
                ))}
            </dl>
            {(showEditAction || onDelete) && (
              <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
                {showEditAction && onEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                    }}
                    className="text-brand-accent-dark hover:underline text-sm font-medium"
                  >
                    {actionLabel(item)}
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item);
                    }}
                    className="text-red-500 hover:underline text-sm font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-brand-silver text-sm">
            {query.trim() ? "No matching results" : "No data found"}
          </p>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-brand-gray">
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someVisibleSelected;
                    }}
                    onChange={toggleSelectAllVisible}
                    disabled={visibleIds.length === 0}
                    aria-label="Select all visible rows"
                    className="rounded border-gray-300"
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSortable = sortable && col.sortable !== false;
                const isActive = sort?.key === col.key;
                return (
                  <th key={col.key} className="px-4 py-3 text-left font-medium text-brand-navy whitespace-nowrap">
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col)}
                        className={cn(
                          "inline-flex items-center gap-1.5 hover:text-brand-accent-dark transition-colors",
                          isActive && "text-brand-accent-dark"
                        )}
                      >
                        {col.label}
                        {isActive ? (
                          sort?.dir === "asc" ? (
                            <ChevronUp className="w-3.5 h-3.5 shrink-0" aria-hidden />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 shrink-0" aria-hidden />
                          )
                        ) : (
                          <ChevronUp className="w-3.5 h-3.5 shrink-0 opacity-25" aria-hidden />
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
              {(showEditAction || onDelete) && (
                <th className="px-4 py-3 text-right font-medium text-brand-navy whitespace-nowrap">
                  {showEditAction && onDelete ? "Actions" : onDelete ? "Delete" : "Actions"}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <tr
                key={item.id}
                onClick={rowClickHandler ? () => rowClickHandler(item) : undefined}
                className={cn("border-t border-gray-100", rowClickHandler && rowClass(item))}
              >
                {selectable && (
                  <td className="px-4 py-3 w-10" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      aria-label="Select row"
                      className="rounded border-gray-300"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-brand-dark min-w-0">
                    {cellValue(item, col)}
                  </td>
                ))}
                {(showEditAction || onDelete) && (
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    {showEditAction && onEdit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                        className="text-brand-accent-dark hover:underline text-xs"
                      >
                        {actionLabel(item)}
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item);
                        }}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + selectionColSpan + actionsColSpan}
                  className="px-4 py-10 text-center text-brand-silver"
                >
                  {query.trim() ? "No matching results" : "No data found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
