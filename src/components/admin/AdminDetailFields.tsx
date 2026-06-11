import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DetailField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="text-brand-silver text-sm">{label}</span>
      <div className="font-medium text-brand-dark mt-0.5">{children}</div>
    </div>
  );
}

export function DetailSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-sm font-semibold text-brand-navy">{title}</h4>
      {children}
    </div>
  );
}

export function ActiveBadge({ active, activeLabel = "Active", inactiveLabel = "Inactive" }: {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded text-xs font-medium",
        active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
