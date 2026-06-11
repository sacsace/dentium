"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminListDetailGrid({
  showSidePanel,
  list,
  panel,
  className,
}: {
  showSidePanel: boolean;
  list: ReactNode;
  panel?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-6", showSidePanel && "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]", className)}>
      <div className="min-w-0">{list}</div>
      {showSidePanel && panel}
    </div>
  );
}
