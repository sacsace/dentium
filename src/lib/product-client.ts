import { formatPrice } from "@/lib/utils";
import type { PriceAccess } from "@/lib/membership";

/** Plain product shape safe to pass from Server Components to Client Components. */
export type ClientProduct = {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string | null;
  images: string[];
  price: number | null;
  showPrice: boolean;
  isNew: boolean;
  brand?: string | null;
};

type ProductLike = {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string | null;
  images: string[];
  price: unknown;
  showPrice: boolean;
  isNew?: boolean;
  brand?: string | null;
};

export function toClientProduct(product: ProductLike): ClientProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDesc: product.shortDesc ?? null,
    images: product.images,
    price: product.price != null ? Number(product.price) : null,
    showPrice: product.showPrice,
    isNew: product.isNew ?? false,
    brand: product.brand ?? null,
  };
}

/** Unit price is visible only to full members (and admins). */
export function getProductPriceLabel(product: { price: number | null }, access: PriceAccess): string {
  if (access === "full") return formatPrice(product.price);
  if (access === "associate") return "Full membership required";
  return "Login for Price";
}

export function getCartUnitPrice(product: { price: number | null }, access: PriceAccess): number | null {
  if (access !== "full" || product.price == null) return null;
  return product.price;
}
