"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminDetailModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  wide?: boolean;
};

export function AdminDetailModal({ open, onClose, title, subtitle, children, wide }: AdminDetailModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className={`bg-white w-full flex flex-col max-h-[100dvh] sm:max-h-[90vh] sm:rounded-sm ${
          wide ? "sm:max-w-[922px]" : "sm:max-w-[806px]"
        }`}
      >
        <div className="flex items-start justify-between p-4 sm:p-6 border-b shrink-0 sticky top-0 bg-white z-10 gap-3">
          <div className="min-w-0">
            <div className="text-lg font-semibold text-brand-navy">{title}</div>
            {subtitle}
          </div>
          <button type="button" onClick={onClose} className="text-brand-silver hover:text-brand-dark shrink-0 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

type AdminDetailPanelProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  onClose?: () => void;
  loading?: boolean;
  className?: string;
};

export function AdminDetailPanel({
  title,
  subtitle,
  children,
  onClose,
  loading,
  className,
}: AdminDetailPanelProps) {
  return (
    <div className={cn("bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden", className)}>
      <div className="flex items-start justify-between p-4 sm:p-6 border-b gap-3 bg-brand-gray/20">
        <div className="min-w-0">
          <div className="text-lg font-semibold text-brand-navy">{title}</div>
          {subtitle}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-brand-silver hover:text-brand-dark shrink-0 p-1"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
        {loading ? <p className="text-sm text-brand-silver">Loading details...</p> : children}
      </div>
    </div>
  );
}

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-brand-navy">{title}</h1>
        {description && <p className="text-brand-silver text-sm mt-1">{description}</p>}
      </div>
      {action && <div className="shrink-0 w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto">{action}</div>}
    </div>
  );
}
