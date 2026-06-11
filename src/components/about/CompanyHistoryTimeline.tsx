import { CompanyHistoryEntry } from "@/lib/site-config";

interface CompanyHistoryTimelineProps {
  items: CompanyHistoryEntry[];
}

export function CompanyHistoryTimeline({ items }: CompanyHistoryTimelineProps) {
  if (items.length === 0) return null;

  return (
    <div className="relative max-w-4xl">
      <div
        className="absolute left-4 sm:left-[1.65rem] top-3 bottom-3 w-px bg-gradient-to-b from-brand-accent via-brand-accent/50 to-transparent"
        aria-hidden
      />
      <ul className="space-y-6">
        {items.map((item, index) => (
          <li
            key={`${item.year}-${item.title}-${index}`}
            className="relative pl-12 sm:pl-16"
          >
            <span
              className="absolute left-0 sm:left-1 top-1 flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-full bg-brand-accent text-brand-navy text-[10px] sm:text-xs font-bold ring-4 ring-brand-gray/80"
              aria-hidden
            >
              {String(item.year).slice(-2)}
            </span>
            <span className="sr-only">{item.year}</span>
            <div className="bg-white p-5 sm:p-6 rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                <span className="text-brand-deep text-sm font-semibold tabular-nums">{item.year}</span>
                <h3 className="font-display text-lg font-semibold text-brand-navy">{item.title}</h3>
              </div>
              {item.description && (
                <p className="text-brand-silver text-sm leading-relaxed">{item.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
