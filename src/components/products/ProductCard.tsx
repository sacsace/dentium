"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Sparkles, LogIn, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { ProductLikeButton } from "@/components/products/ProductLikeButton";
import type { ClientProduct } from "@/lib/product-client";
import { getCartUnitPrice, getProductPriceLabel } from "@/lib/product-client";
import type { PriceAccess } from "@/lib/membership";
import { buildProductHref, type ShopFilterParams } from "@/lib/shop-navigation";

interface ProductCardProps {
  product: ClientProduct;
  priceAccess?: PriceAccess;
  isLoggedIn?: boolean;
  fromShop?: boolean;
  shopFilters?: ShopFilterParams;
  likeCount?: number;
}

export function ProductCard({
  product,
  priceAccess = "guest",
  isLoggedIn = false,
  fromShop,
  shopFilters,
  likeCount = 0,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const productHref = fromShop
    ? buildProductHref(product.slug, { fromShop: true, filters: shopFilters })
    : `/products/${product.slug}`;

  const canPurchase = priceAccess === "full";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canPurchase) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] || "",
      price: getCartUnitPrice(product, priceAccess),
    });
  };

  const priceLabel = getProductPriceLabel(product, priceAccess);

  return (
    <div className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
      <div className="relative aspect-square bg-brand-light overflow-hidden">
        <Link href={productHref} className="block w-full h-full">
          {product.images[0] && (
            <Image src={product.images[0]} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
          )}
        </Link>
        {product.isNew && (
          <span className="pointer-events-none absolute top-3 left-3 bg-brand-deep text-white text-xs px-2 py-1 rounded-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> New
          </span>
        )}
        {isLoggedIn && <ProductLikeButton productId={product.id} className="absolute top-3 right-3" />}
        {likeCount > 0 && (
          <span className="absolute top-3 right-14 text-xs bg-white/90 shadow px-2 py-1 rounded-full text-brand-navy">
            ♥ {likeCount}
          </span>
        )}
        {canPurchase && (
          <button
            type="button"
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 p-2.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-accent hover:text-brand-navy z-10"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5">
        <Link href={productHref} className="block">
          {product.brand && (
            <p className="text-brand-silver text-xs uppercase tracking-wider mb-1">{product.brand}</p>
          )}
          <h3 className="font-semibold text-brand-navy mb-1 group-hover:text-brand-deep transition-colors">{product.name}</h3>
          {product.shortDesc && (
            <p className="text-brand-silver text-sm mb-3 line-clamp-2">{product.shortDesc}</p>
          )}
        </Link>

        {priceAccess === "full" ? (
          <p className="text-brand-deep font-medium text-sm">{priceLabel}</p>
        ) : priceAccess === "associate" ? (
          <Link
            href="/account?tab=company"
            className="inline-flex items-center gap-1.5 text-brand-deep font-medium text-sm hover:underline"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Full membership required
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-brand-deep font-medium text-sm hover:underline"
          >
            <LogIn className="w-3.5 h-3.5" /> Login for Price
          </Link>
        )}
      </div>
    </div>
  );
}
