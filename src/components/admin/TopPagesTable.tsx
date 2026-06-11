import type { TopPageStat } from "@/lib/analytics";

export function TopPagesTable({ pages }: { pages: TopPageStat[] }) {
  if (pages.length === 0) {
    return <p className="text-brand-silver text-sm py-4">No page visits recorded yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-brand-silver border-b border-brand-gray">
            <th className="pb-3 font-medium">Page</th>
            <th className="pb-3 font-medium text-right">Views</th>
            <th className="pb-3 font-medium text-right">Visitors</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.path} className="border-b border-brand-gray/60 last:border-0">
              <td className="py-3 pr-4 text-brand-navy font-mono text-xs">{page.path}</td>
              <td className="py-3 text-right text-brand-navy">{page.views.toLocaleString()}</td>
              <td className="py-3 text-right text-brand-silver">{page.visitors.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
