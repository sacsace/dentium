export const SHOP_FILTER_KEYS = ["category", "search", "brand", "tag", "minPrice", "maxPrice"] as const;

export type ShopFilterParams = Partial<Record<(typeof SHOP_FILTER_KEYS)[number], string>>;

export function buildShopHref(filters?: ShopFilterParams): string {
  const params = new URLSearchParams();
  if (filters) {
    for (const key of SHOP_FILTER_KEYS) {
      const value = filters[key];
      if (value) params.set(key, value);
    }
  }
  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}

export function buildProductHref(
  slug: string,
  options?: { fromShop?: boolean; filters?: ShopFilterParams }
): string {
  if (!options?.fromShop) return `/products/${slug}`;

  const params = new URLSearchParams();
  params.set("from", "shop");
  if (options.filters) {
    for (const key of SHOP_FILTER_KEYS) {
      const value = options.filters[key];
      if (value) params.set(key, value);
    }
  }
  return `/products/${slug}?${params.toString()}`;
}

export function getShopBackHref(searchParams: ShopFilterParams & { from?: string }): string {
  if (searchParams.from === "shop" || SHOP_FILTER_KEYS.some((key) => searchParams[key])) {
    return buildShopHref(searchParams);
  }
  return "/shop";
}
