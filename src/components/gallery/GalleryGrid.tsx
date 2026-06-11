"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { cn } from "@/lib/utils";

export interface GalleryItem {
  id: string;
  title: string | null;
  caption: string | null;
  imageUrl: string;
  category: string | null;
}

interface GalleryGridProps {
  items: GalleryItem[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((item) => item.category === activeCategory);
  }, [items, activeCategory]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goPrev = useCallback(() => {
    setLightboxIndex((index) => {
      if (index == null || filtered.length === 0) return index;
      return (index - 1 + filtered.length) % filtered.length;
    });
  }, [filtered.length]);

  const goNext = useCallback(() => {
    setLightboxIndex((index) => {
      if (index == null || filtered.length === 0) return index;
      return (index + 1) % filtered.length;
    });
  }, [filtered.length]);

  useEffect(() => {
    setLightboxIndex(null);
  }, [activeCategory]);

  useEffect(() => {
    if (lightboxIndex == null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, closeLightbox, goPrev, goNext]);

  if (items.length === 0) {
    return (
      <p className="text-center text-brand-silver text-sm py-16">
        No gallery photos yet. Please check back soon.
      </p>
    );
  }

  const activeItem = lightboxIndex != null ? filtered[lightboxIndex] : null;

  return (
    <>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-4 py-2 text-sm rounded-sm transition-colors",
              activeCategory === "all" ? "bg-brand-accent text-brand-navy" : "bg-brand-gray text-brand-dark hover:bg-brand-light"
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-4 py-2 text-sm rounded-sm transition-colors",
                activeCategory === category ? "bg-brand-accent text-brand-navy" : "bg-brand-gray text-brand-dark hover:bg-brand-light"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="group relative aspect-[4/3] rounded-sm overflow-hidden bg-brand-gray text-left"
          >
            <RemoteImage
              src={item.imageUrl}
              alt={item.title || "Gallery photo"}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {(item.title || item.category) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.title && <p className="text-white text-sm font-medium">{item.title}</p>}
                {item.category && <p className="text-white/70 text-xs mt-0.5">{item.category}</p>}
              </div>
            )}
          </button>
        ))}
      </div>

      {activeItem && lightboxIndex != null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
          role="presentation"
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {filtered.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 text-white/80 hover:text-white bg-white/10 rounded-full"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 text-white/80 hover:text-white bg-white/10 rounded-full"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="relative w-full max-w-5xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-[4/3] max-h-[75vh]">
              <RemoteImage
                src={activeItem.imageUrl}
                alt={activeItem.title || "Gallery photo"}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
            {(activeItem.title || activeItem.caption) && (
              <div className="mt-4 text-center max-w-2xl">
                {activeItem.title && <p className="text-white font-medium">{activeItem.title}</p>}
                {activeItem.caption && <p className="text-white/70 text-sm mt-1">{activeItem.caption}</p>}
              </div>
            )}
            {filtered.length > 1 && (
              <p className="text-white/50 text-xs mt-3">
                {lightboxIndex + 1} / {filtered.length}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
