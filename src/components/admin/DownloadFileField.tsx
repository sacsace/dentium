"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatFileSize } from "@/lib/format-file-size";

export interface DownloadFileMeta {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
}

interface DownloadFileFieldProps {
  value: DownloadFileMeta | null;
  onChange: (value: DownloadFileMeta | null) => void;
}

export function DownloadFileField({ value, onChange }: DownloadFileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/downloads/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {value && (
        <div className="flex items-center justify-between gap-3 p-3 bg-brand-gray/50 rounded-sm border border-gray-200">
          <div className="min-w-0">
            <p className="text-sm font-medium text-brand-navy truncate">{value.fileName}</p>
            <p className="text-xs text-brand-silver">
              {value.fileType} · {formatFileSize(value.fileSizeBytes)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="shrink-0 p-1 text-brand-silver hover:text-red-500"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <Button type="button" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
        {uploading ? "Uploading..." : value ? "Replace File" : "Upload File"}
      </Button>

      <p className="text-xs text-brand-silver">PDF, DOC, DOCX, XLS, XLSX, ZIP · max 20MB</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
