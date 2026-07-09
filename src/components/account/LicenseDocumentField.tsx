"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, X } from "lucide-react";
import { uploadFile } from "@/lib/upload";
import { inputClass } from "@/components/admin/AdminForm";
import { Button } from "@/components/ui/Button";

export function LicenseDocumentField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const ok = file.type.startsWith("image/") || file.type === "application/pdf";
    if (!ok) {
      setError("Upload a JPG, PNG, or PDF file");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isPdf = value.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-3">
      {value && (
        <div className="relative group flex items-center gap-3 p-3 bg-brand-gray rounded-xl border border-gray-100">
          {isPdf ? (
            <FileText className="w-8 h-8 text-brand-deep shrink-0" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="License" className="w-16 h-16 object-cover rounded-lg border" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-brand-navy truncate">
              {isPdf ? "License document (PDF)" : "License image"}
            </p>
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-deep hover:underline">
              View file
            </a>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="p-1 text-brand-silver hover:text-red-500"
            aria-label="Remove license"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          {uploading ? "Uploading..." : value ? "Replace License" : "Upload License Copy"}
        </Button>
        <span className="text-xs text-brand-silver">JPG, PNG, or PDF · max 10MB</span>
      </div>

      <input
        className={inputClass}
        placeholder="Or paste document URL"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
