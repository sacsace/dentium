import Link from "next/link";
import { Eye, PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "visitor" | "product";

const TABS: { id: Tab; label: string; icon: typeof Eye }[] = [
  { id: "visitor", label: "Visitor", icon: Eye },
  { id: "product", label: "Product", icon: PackageSearch },
];

export function AnalyticsTabs({ active }: { active: Tab }) {
  return (
    <div className="flex border-b border-gray-200 mb-6">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;

        return (
          <Link
            key={tab.id}
            href={`/admin/analytics?tab=${tab.id}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              isActive
                ? "border-brand-accent text-brand-navy"
                : "border-transparent text-brand-silver hover:text-brand-navy"
            )}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
