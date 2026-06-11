"use client";

import { ReactNode } from "react";
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
}

export function AdminForm({ title, children, onSubmit, onClose, loading, wide }: AdminFormProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className={`bg-white w-full sm:rounded-sm ${wide ? "sm:max-w-4xl" : "sm:max-w-2xl"} max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-base sm:text-lg font-semibold text-brand-navy pr-4">{title}</h2>
          <button type="button" onClick={onClose} className="text-brand-silver hover:text-brand-dark shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-4 sm:p-6 space-y-4">
          {children}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
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
};

export function AdminInlineForm({
  title,
  subtitle,
  children,
  onSubmit,
  onCancel,
  loading,
  className,
}: AdminInlineFormProps) {
  return (
    <div className={cn("bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden", className)}>
      <div className="flex items-start justify-between p-4 sm:p-6 border-b gap-3 bg-brand-gray/20">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-brand-navy">{title}</h2>
          {subtitle}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-brand-silver hover:text-brand-dark shrink-0 p-1"
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
        {children}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
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
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-navy mb-1">{label}</label>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-deep";
