import { formatPrice } from "@/lib/utils";

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

/** Unit price is visible only to authenticated users. */
export function getProductPriceLabel(product: { price: number | null }, isLoggedIn: boolean): string {
  if (!isLoggedIn) return "Login for Price";
  return formatPrice(product.price);
}

export function getCartUnitPrice(product: { price: number | null }, isLoggedIn: boolean): number | null {
  if (!isLoggedIn || product.price == null) return null;
  return product.price;
}
