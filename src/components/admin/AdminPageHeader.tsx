"use client";

import { ReactNode } from "react";
import { ChevronRight, X } from "lucide-react";
import { ADMIN_MODAL_OVERLAY, ADMIN_MODAL_PANEL } from "@/lib/admin-dialog";
import { cn } from "@/lib/utils";

type BreadcrumbItem = { id: string; label: string };

export function AdminPanelBreadcrumb({
  items,
  onNavigate,
}: {
  items: BreadcrumbItem[];
  onNavigate?: (id: string) => void;
}) {
  return (
    <nav aria-label="Panel navigation" className="flex flex-wrap items-center gap-1 text-xs mb-3">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.id} className="inline-flex items-center gap-1 min-w-0">
            {index > 0 && <ChevronRight className="w-3 h-3 text-brand-silver/70 shrink-0" />}
            {isLast || !onNavigate ? (
              <span className={cn("truncate max-w-[12rem] sm:max-w-none", isLast ? "text-brand-navy font-medium" : "text-brand-silver")}>
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                className="text-brand-silver hover:text-brand-deep underline-offset-2 hover:underline truncate max-w-[10rem] sm:max-w-none"
              >
                {item.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}

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
    <div className={ADMIN_MODAL_OVERLAY}>
      <div
        className={cn(
          ADMIN_MODAL_PANEL,
          wide ? "sm:max-w-[922px]" : "sm:max-w-[806px]"
        )}
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
  breadcrumb?: ReactNode;
  headerAction?: ReactNode;
};

export function AdminDetailPanel({
  title,
  subtitle,
  children,
  onClose,
  loading,
  className,
  breadcrumb,
  headerAction,
}: AdminDetailPanelProps) {
  return (
    <div className={cn("bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden", className)}>
      <div className="p-4 sm:p-6 border-b gap-3 bg-brand-gray/20">
        {breadcrumb}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-semibold text-brand-navy">{title}</div>
            {subtitle}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {headerAction}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-brand-silver hover:text-brand-dark p-1"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
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
