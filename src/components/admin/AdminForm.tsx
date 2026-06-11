"use client";

import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminFormProps {
  title: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  loading?: boolean;
  wide?: boolean;
  error?: string | null;
}

export function AdminForm({ title, children, onSubmit, onClose, loading, wide, error }: AdminFormProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className={cn(
          "bg-white w-full sm:rounded-sm max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto shadow-xl",
          wide ? "sm:max-w-4xl" : "sm:max-w-2xl",
          error && "ring-2 ring-red-200"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-form-title"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <h2 id="admin-form-title" className="text-base sm:text-lg font-semibold text-brand-navy pr-4">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="text-brand-silver hover:text-brand-dark shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-4 sm:mx-6 mt-4 flex gap-3 rounded-sm border border-red-200 bg-red-50 px-4 py-3" role="alert">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-medium text-red-800">Could not save</p>
              <p className="text-sm text-red-700/90 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="p-4 sm:p-6 space-y-4">
          {children}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

type AdminInlineFormProps = {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
  error?: string | null;
  breadcrumb?: ReactNode;
  cancelLabel?: string;
};

export function AdminInlineForm({
  title,
  subtitle,
  children,
  onSubmit,
  onCancel,
  loading,
  className,
  error,
  breadcrumb,
  cancelLabel = "Cancel",
}: AdminInlineFormProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-sm shadow-sm border overflow-hidden",
        error ? "border-red-200 ring-1 ring-red-100" : "border-gray-100",
        className
      )}
    >
      <div className="p-4 sm:p-6 border-b gap-3 bg-brand-gray/20">
        {breadcrumb}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-brand-navy">{title}</h2>
            {subtitle}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-brand-silver hover:text-brand-dark shrink-0 p-1"
            aria-label={cancelLabel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-4 sm:mx-6 mt-4 flex gap-3 rounded-sm border border-red-200 bg-red-50 px-4 py-3" role="alert">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-medium text-red-800">Could not save</p>
            <p className="text-sm text-red-700/90 mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
        {children}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto">
            {cancelLabel}
          </Button>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function FormField({
  label,
  children,
  error,
  required,
}: {
  label: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-navy mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className={cn(error && "[&_input]:border-red-300 [&_input]:focus:border-red-500 [&_textarea]:border-red-300 [&_textarea]:focus:border-red-500 [&_select]:border-red-300 [&_select]:focus:border-red-500")}>
        {children}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-deep";

export const inputErrorClass =
  "w-full px-3 py-2 border border-red-300 rounded-sm text-sm focus:outline-none focus:border-red-500 bg-red-50/30";
