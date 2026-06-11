"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadFile } from "@/lib/upload";
import { inputClass } from "@/components/admin/AdminForm";
import { Button } from "@/components/ui/Button";
import { detectFaceCenter, DEFAULT_PHOTO_FOCAL } from "@/lib/detect-face-center";

export interface TeamPhotoValue {
  photoUrl: string;
  photoFocalX: number;
  photoFocalY: number;
}

interface TeamPhotoFieldProps {
  value: TeamPhotoValue;
  onChange: (value: TeamPhotoValue) => void;
  hasError?: boolean;
}

export function TeamPhotoField({ value, onChange, hasError }: TeamPhotoFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const applyPhoto = async (photoUrl: string) => {
    setDetecting(true);
    try {
      const focal = photoUrl ? await detectFaceCenter(photoUrl) : DEFAULT_PHOTO_FOCAL;
      onChange({
        photoUrl,
        photoFocalX: focal.x,
        photoFocalY: focal.y,
      });
    } finally {
      setDetecting(false);
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;

    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadFile(file);
      await applyPhoto(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const busy = uploading || detecting;
  const previewStyle = {
    objectPosition: `${value.photoFocalX}% ${value.photoFocalY}%`,
  };

  return (
    <div className="space-y-3">
      {value.photoUrl && (
        <div
          className={`relative group w-fit ${hasError ? "rounded-full ring-2 ring-red-400" : ""}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.photoUrl}
            alt="Team member preview"
            className="w-32 h-32 object-cover rounded-full border-2 border-gray-200 grayscale-[0.85] contrast-[1.05]"
            style={previewStyle}
          />
          <button
            type="button"
            onClick={() =>
              onChange({ photoUrl: "", photoFocalX: DEFAULT_PHOTO_FOCAL.x, photoFocalY: DEFAULT_PHOTO_FOCAL.y })
            }
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          {uploading ? "Uploading..." : detecting ? "Centering face..." : value.photoUrl ? "Replace Photo" : "Upload Photo"}
        </Button>
        <span className="text-xs text-brand-silver">
          Face auto-centered · shown in grayscale on site
        </span>
        {value.photoUrl && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => void applyPhoto(value.photoUrl)}
          >
            Re-center face
          </Button>
        )}
      </div>

      <input
        className={inputClass}
        placeholder="Or paste image URL"
        value={value.photoUrl}
        onChange={(e) => {
          const url = e.target.value;
          if (!url.trim()) {
            onChange({ photoUrl: "", photoFocalX: DEFAULT_PHOTO_FOCAL.x, photoFocalY: DEFAULT_PHOTO_FOCAL.y });
            return;
          }
          onChange({ ...value, photoUrl: url });
        }}
        onBlur={(e) => {
          const url = e.target.value.trim();
          if (url && url !== value.photoUrl) void applyPhoto(url);
        }}
      />

      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
    </div>
  );
}
