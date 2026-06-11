import type { DailyVisitStat } from "@/lib/analytics";

function formatDayLabel(date: string) {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
}

export function VisitorChart({ data }: { data: DailyVisitStat[] }) {
  const maxViews = Math.max(...data.map((d) => d.views), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2 h-40">
        {data.map((day) => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <span className="text-[10px] text-brand-silver">{day.views}</span>
            <div className="w-full flex items-end justify-center gap-0.5 h-28">
              <div
                className="w-[42%] bg-brand-deep/80 rounded-t-sm transition-all"
                style={{ height: `${Math.max((day.views / maxViews) * 100, day.views > 0 ? 8 : 0)}%` }}
                title={`${day.views} page views`}
              />
              <div
                className="w-[42%] bg-teal-500/70 rounded-t-sm transition-all"
                style={{ height: `${Math.max((day.visitors / maxViews) * 100, day.visitors > 0 ? 8 : 0)}%` }}
                title={`${day.visitors} unique visitors`}
              />
            </div>
            <span className="text-[10px] text-brand-silver truncate w-full text-center">{formatDayLabel(day.date)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-brand-silver">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-brand-deep/80" /> Page views
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-teal-500/70" /> Unique visitors
        </span>
      </div>
    </div>
  );
}
