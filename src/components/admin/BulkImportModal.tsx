"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { AdminDetailModal } from "@/components/admin/AdminPageHeader";
import { FormField, inputClass } from "@/components/admin/AdminForm";
import { Button } from "@/components/ui/Button";
import { downloadCsvTemplate, type BulkImportResult } from "@/lib/csv-import";
import { readSpreadsheetAsCsv } from "@/lib/spreadsheet-client";

type BulkImportModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  templateFilename: string;
  templateContent: string;
  columnsHelp: string;
  importEndpoint: string;
  onComplete: () => void;
  acceptExcel?: boolean;
};

export function BulkImportModal({
  open,
  onClose,
  title,
  description,
  templateFilename,
  templateContent,
  columnsHelp,
  importEndpoint,
  onComplete,
  acceptExcel = false,
}: BulkImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    (BulkImportResult & { updated?: number; skipped?: number; duplicates?: { row: number; name?: string; erpCustomerNumber: string; message: string }[] }) | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setCsvText("");
    setFileName(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    try {
      const text = acceptExcel ? await readSpreadsheetAsCsv(file) : await file.text();
      setCsvText(text);
      setFileName(file.name);
      setResult(null);
      setError(null);
    } catch {
      setError("Could not read file. Use CSV or Excel (.xlsx).");
    }
  };

  const handleImport = async () => {
    if (!csvText.trim()) {
      setError("Paste CSV content or upload a file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(importEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvText, fileName }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Import failed");
        return;
      }

      setResult(data as BulkImportResult & { updated?: number; skipped?: number });
      const imported = (data.created ?? 0) + (data.updated ?? 0);
      if (imported > 0) onComplete();
    } catch {
      setError("Import failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminDetailModal
      open={open}
      onClose={handleClose}
      title={title}
      subtitle={<p className="text-sm text-brand-silver mt-1">{description}</p>}
      wide
    >
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => downloadCsvTemplate(templateFilename, templateContent)}
          >
            <Download className="w-4 h-4" />
            Download template
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4" />
            Upload {acceptExcel ? "CSV / Excel" : "CSV file"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptExcel ? ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : ".csv,text/csv"}
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
        </div>

        <p className="text-xs text-brand-silver leading-relaxed">{columnsHelp}</p>

        <FormField label="CSV content">
          <textarea
            className={`${inputClass} font-mono text-xs min-h-[220px]`}
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              setResult(null);
              setError(null);
            }}
            placeholder="Paste CSV rows here (include header row)..."
          />
        </FormField>

        {error && (
          <div className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {result && (
          <div className="rounded-sm border border-gray-200 bg-brand-gray/30 px-4 py-3 text-sm space-y-2">
            <p className="font-medium text-brand-navy">
              {result.created} created
              {result.updated != null && result.updated > 0 ? `, ${result.updated} updated` : ""}
              {result.skipped != null && result.skipped > 0 ? `, ${result.skipped} skipped` : ""}.
            </p>
            {result.duplicates && result.duplicates.length > 0 && (
              <div>
                <p className="text-amber-700 font-medium mb-1">{result.duplicates.length} duplicate row(s) — existing records updated:</p>
                <ul className="space-y-1 text-brand-dark max-h-40 overflow-y-auto">
                  {result.duplicates.map((item) => (
                    <li key={`dup-${item.row}-${item.erpCustomerNumber}`}>
                      Row {item.row}
                      {item.name ? ` (${item.name})` : ""}: {item.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.failed.length > 0 && (
              <div>
                <p className="text-red-700 font-medium mb-1">{result.failed.length} row(s) failed:</p>
                <ul className="space-y-1 text-brand-dark max-h-40 overflow-y-auto">
                  {result.failed.map((item) => (
                    <li key={`${item.row}-${item.name ?? "row"}`}>
                      Row {item.row}
                      {item.name ? ` (${item.name})` : ""}: {item.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-gray-100">
          <Button type="button" variant="ghost" onClick={handleClose} className="w-full sm:w-auto">
            Close
          </Button>
          <Button type="button" onClick={handleImport} disabled={loading} className="w-full sm:w-auto">
            {loading ? "Importing..." : "Import"}
          </Button>
        </div>
      </div>
    </AdminDetailModal>
  );
}
