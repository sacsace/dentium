"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteSearch } from "@/components/search/SiteSearch";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

type SearchResult = {
  id: string;
  type: string;
  title: string;
  excerpt?: string | null;
  href: string;
  image?: string | null;
  date?: string | null;
  category?: string | null;
};

const TYPE_TABS = [
  { id: "all", label: "All" },
  { id: "product", label: "Products" },
  { id: "blog", label: "Blog" },
  { id: "news", label: "News" },
  { id: "event", label: "Events" },
  { id: "video", label: "Videos" },
  { id: "page", label: "Pages" },
] as const;

const SORT_OPTIONS = [
  { id: "relevance", label: "Relevance" },
  { id: "date", label: "Newest" },
  { id: "title", label: "Title A–Z" },
] as const;

const TYPE_LABELS: Record<string, string> = {
  product: "Product",
  blog: "Blog",
  news: "News",
  event: "Event",
  video: "Video",
  page: "Page",
  download: "Download",
};

export function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all";
  const sort = searchParams.get("sort") || "relevance";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({ q: query, type, sort, limit: "40" });
    fetch(`/api/search?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : { results: [], total: 0 }))
      .then((data) => {
        setResults(data.results ?? []);
        setTotal(data.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, [query, type, sort]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "relevance") params.set(key, value);
    else params.delete(key);
    if (query) params.set("q", query);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      <SiteSearch variant="page" autoFocus className="max-w-2xl" />

      {query.trim() && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-brand-silver text-sm">
              {loading ? "Searching..." : `${total} result${total === 1 ? "" : "s"} for "${query}"`}
            </p>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="text-sm border border-gray-200 rounded-sm px-3 py-2 bg-white"
              aria-label="Sort results"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => updateParam("type", tab.id)}
                className={cn(
                  "px-4 py-2 text-sm rounded-sm transition-colors",
                  type === tab.id ? "bg-brand-accent text-brand-navy font-medium" : "bg-brand-gray text-brand-dark"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {!loading && results.length === 0 && (
            <p className="text-brand-silver">No results found. Try different keywords or filters.</p>
          )}

          <div className="space-y-3">
            {results.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex gap-4 p-4 bg-brand-gray rounded-xl hover:bg-brand-light transition-colors"
              >
                {item.image && (
                  <div className="relative w-20 h-20 shrink-0 rounded-sm overflow-hidden bg-white">
                    <Image src={item.image} alt="" fill className="object-cover" sizes="80px" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-brand-accent/25 text-brand-navy">
                      {TYPE_LABELS[item.type] ?? item.type}
                    </span>
                    {item.category && <span className="text-xs text-brand-silver">{item.category}</span>}
                    {item.date && <span className="text-xs text-brand-silver">{formatDate(item.date)}</span>}
                  </div>
                  <h3 className="font-medium text-brand-navy">{item.title}</h3>
                  {item.excerpt && <p className="text-sm text-brand-silver line-clamp-2 mt-1">{item.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {!query.trim() && (
        <p className="text-brand-silver text-sm">Enter a keyword to search products, blog posts, events, videos, and pages.</p>
      )}
    </div>
  );
}
