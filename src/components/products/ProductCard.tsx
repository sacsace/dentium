"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Sparkles, LogIn } from "lucide-react";
import { useCartStore } from "@/store/cart";
import type { ClientProduct } from "@/lib/product-client";
import { getCartUnitPrice, getProductPriceLabel } from "@/lib/product-client";
import { buildProductHref, type ShopFilterParams } from "@/lib/shop-navigation";

interface ProductCardProps {
  product: ClientProduct;
  isLoggedIn?: boolean;
  fromShop?: boolean;
  shopFilters?: ShopFilterParams;
}

export function ProductCard({ product, isLoggedIn = false, fromShop, shopFilters }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const productHref = fromShop
    ? buildProductHref(product.slug, { fromShop: true, filters: shopFilters })
    : `/products/${product.slug}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] || "",
      price: getCartUnitPrice(product, isLoggedIn),
    });
  };

  const priceLabel = getProductPriceLabel(product, isLoggedIn);

  return (
    <Link href={productHref} className="group block bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
      <div className="relative aspect-square bg-brand-light overflow-hidden">
        {product.images[0] && (
          <Image src={product.images[0]} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
        )}
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-brand-deep text-white text-xs px-2 py-1 rounded-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> New
          </span>
        )}
        {isLoggedIn && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 p-2.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-accent hover:text-brand-navy"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-5">
        {product.brand && (
          <p className="text-brand-silver text-xs uppercase tracking-wider mb-1">{product.brand}</p>
        )}
        <h3 className="font-semibold text-brand-navy mb-1 group-hover:text-brand-deep transition-colors">{product.name}</h3>
        {product.shortDesc && (
          <p className="text-brand-silver text-sm mb-3 line-clamp-2">{product.shortDesc}</p>
        )}
        {!isLoggedIn ? (
          <Link
            href="/auth/login"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-brand-deep font-medium text-sm hover:underline"
          >
            <LogIn className="w-3.5 h-3.5" /> Login for Price
          </Link>
        ) : (
          <p className="text-brand-deep font-medium text-sm">{priceLabel}</p>
        )}
      </div>
    </Link>
  );
}
