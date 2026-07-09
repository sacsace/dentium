"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SuggestResult = {
  id: string;
  type: string;
  title: string;
  href: string;
  excerpt?: string | null;
};

const TYPE_LABELS: Record<string, string> = {
  product: "Product",
  blog: "Blog",
  news: "News",
  event: "Event",
  video: "Video",
  page: "Page",
  download: "Download",
};

type SiteSearchProps = {
  variant?: "header" | "page";
  className?: string;
  autoFocus?: boolean;
};

export function SiteSearch({ variant = "header", className, autoFocus }: SiteSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<SuggestResult[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/search/suggest?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
        setResults(data.results ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const goToSearch = (q?: string) => {
    const term = (q ?? query).trim();
    if (!term) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const isPage = variant === "page";

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToSearch();
        }}
        className="relative"
      >
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            fetchSuggestions(query);
          }}
          autoFocus={autoFocus}
          placeholder="Search products, news, events..."
          className={cn(
            "w-full border rounded-sm text-sm focus:outline-none focus:border-brand-deep transition-colors",
            isPage
              ? "pl-5 pr-12 py-3.5 border-gray-200 bg-white"
              : "pl-4 pr-10 py-2 border-brand-muted/60 bg-white/90"
          )}
          aria-label="Site search"
          aria-expanded={open}
          aria-controls="site-search-dropdown"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-brand-silver hover:text-brand-dark"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 text-brand-silver hover:text-brand-deep",
            isPage && "right-4"
          )}
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>

      {open && (
        <div
          id="site-search-dropdown"
          className={cn(
            "absolute z-50 mt-2 w-full bg-white border border-brand-muted/60 rounded-sm shadow-soft overflow-hidden",
            isPage ? "max-h-[420px]" : "max-h-96"
          )}
        >
          {suggestions.length > 0 && !query.trim() && (
            <div className="p-3 border-b border-brand-muted/40">
              <p className="text-[11px] uppercase tracking-wider text-brand-silver mb-2">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 6).map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      goToSearch(term);
                    }}
                    className="px-3 py-1 text-xs rounded-full bg-brand-gray text-brand-dark hover:bg-brand-accent/30"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && <p className="px-4 py-3 text-sm text-brand-silver">Searching...</p>}

          {!loading && query.trim() && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-brand-silver">No results found.</p>
          )}

          {results.length > 0 && (
            <ul className="max-h-72 overflow-y-auto">
              {results.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-brand-gray transition-colors"
                  >
                    <span className="shrink-0 mt-0.5 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-brand-accent/20 text-brand-navy">
                      {TYPE_LABELS[item.type] ?? item.type}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-brand-navy truncate">{item.title}</span>
                      {item.excerpt && (
                        <span className="block text-xs text-brand-silver truncate">{item.excerpt}</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {query.trim() && (
            <button
              type="button"
              onClick={() => goToSearch()}
              className="w-full px-4 py-3 text-sm text-left text-brand-deep hover:bg-brand-gray border-t border-brand-muted/40 font-medium"
            >
              View all results for &ldquo;{query.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
