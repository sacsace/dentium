"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { toClientProduct } from "@/lib/product-client";
import { getProductPriceLabel } from "@/lib/product-client";

type FavoriteProduct = {
  id: string;
  name: string;
  slug: string;
  images: string[];
  brand: string | null;
  shortDesc: string | null;
  price: string | number | null;
  showPrice: boolean;
};

export function FavoriteProductsSection() {
  const [products, setProducts] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/favorites?detail=1")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.products) setProducts(data.products);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-brand-silver text-sm mb-12">Loading favorites...</p>;
  }

  if (products.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-brand-navy tracking-tight mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5" /> Liked Products
        </h2>
        <p className="text-brand-silver text-sm">No liked products yet. Tap the heart on any product to save it here.</p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold text-brand-navy tracking-tight mb-4 flex items-center gap-2">
        <Heart className="w-5 h-5 fill-red-500 text-red-500" /> Liked Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const clientProduct = toClientProduct(product);
          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="flex gap-3 p-4 bg-brand-gray rounded-xl hover:shadow-md transition-shadow"
            >
              {product.images[0] && (
                <div className="relative w-16 h-16 shrink-0 rounded-sm overflow-hidden">
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                </div>
              )}
              <div className="min-w-0">
                {product.brand && (
                  <p className="text-brand-silver text-xs uppercase tracking-wider">{product.brand}</p>
                )}
                <p className="font-medium text-brand-navy truncate">{product.name}</p>
                <p className="text-brand-deep text-sm">{getProductPriceLabel(clientProduct, true)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
