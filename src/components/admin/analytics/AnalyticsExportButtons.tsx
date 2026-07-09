"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

type AnalyticsExportButtonsProps = {
  activeTab: "visitor" | "product";
};

export function AnalyticsExportButtons({ activeTab }: AnalyticsExportButtonsProps) {
  const handleExport = () => {
    window.location.href = `/api/admin/analytics/export?type=${activeTab}&days=30`;
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleExport}>
      <Download className="w-4 h-4" /> Export CSV
    </Button>
  );
}
