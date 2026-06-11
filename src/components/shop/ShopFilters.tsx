"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ShopFiltersProps {
  categories: { id: string; name: string; slug: string }[];
  brands: string[];
}

export function ShopFilters({ categories, brands }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/shop?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", search);
  };

  return (
    <div className="bg-brand-gray p-6 rounded-sm space-y-6 sticky top-28">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-deep"
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-silver">
          <Search className="w-4 h-4" />
        </button>
      </form>

      <div>
        <h4 className="font-semibold text-brand-navy text-sm mb-3">Category</h4>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter("category", "")}
            className={`block w-full text-left px-3 py-2 text-sm rounded-sm transition-colors ${
              !searchParams.get("category") ? "bg-brand-accent text-brand-navy" : "hover:bg-white"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter("category", cat.slug)}
              className={`block w-full text-left px-3 py-2 text-sm rounded-sm transition-colors ${
                searchParams.get("category") === cat.slug ? "bg-brand-accent text-brand-navy" : "hover:bg-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <h4 className="font-semibold text-brand-navy text-sm mb-3">Brand</h4>
          <div className="space-y-1">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => updateFilter("brand", brand)}
                className={`block w-full text-left px-3 py-2 text-sm rounded-sm transition-colors ${
                  searchParams.get("brand") === brand ? "bg-brand-accent text-brand-navy" : "hover:bg-white"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => router.push("/shop")}
      >
        Clear Filters
      </Button>
    </div>
  );
}
