"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart";
import type { ClientProduct } from "@/lib/product-client";
import { formatPrice } from "@/lib/utils";

type Variant = { id: string; name: string; sku: string | null; price: number | null };
type BundleGroup = {
  groupKey: string;
  label: string;
  required: boolean;
  options: { bundleItemId: string; productId: string; name: string; quantity: number; price: number | null }[];
};

type ProductConfig = {
  id: string;
  name: string;
  slug: string;
  images: string[];
  price: number | null;
  productType: string;
  gstRate: number;
  variants: Variant[];
  bundleGroups: BundleGroup[];
};

export function ProductPurchaseOptions({
  product,
  slug,
}: {
  product: Pick<ClientProduct, "id" | "name" | "slug" | "images" | "price" | "showPrice">;
  slug: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [config, setConfig] = useState<ProductConfig | null>(null);
  const [variantId, setVariantId] = useState("");
  const [bundleChoices, setBundleChoices] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/products/${slug}/config`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setConfig(data);
        if (data.variants?.length === 1) setVariantId(data.variants[0].id);
        const defaults: Record<string, string> = {};
        for (const group of data.bundleGroups || []) {
          if (group.options[0]) defaults[group.groupKey] = group.options[0].productId;
        }
        setBundleChoices(defaults);
      })
      .catch(() => undefined);
  }, [slug]);

  const selectedVariant = config?.variants.find((v) => v.id === variantId) ?? null;
  const unitPrice =
    selectedVariant?.price ?? config?.price ?? product.price ?? null;

  const handleAdd = () => {
    if (config?.variants.length && !variantId) return;

    const displayName =
      selectedVariant != null ? `${product.name} — ${selectedVariant.name}` : product.name;

    addItem({
      productId: product.id,
      variantId: variantId || null,
      variantLabel: selectedVariant?.name ?? null,
      name: displayName,
      slug: product.slug,
      image: product.images[0] || "",
      price: unitPrice,
    });
  };

  if (!config) {
    return (
      <Button disabled>
        <ShoppingCart className="w-4 h-4" />
        Add to Cart
      </Button>
    );
  }

  return (
    <div className="space-y-4 mb-8">
      {config.productType === "BUNDLE" && config.bundleGroups.length > 0 && (
        <div className="space-y-3 p-4 bg-brand-gray rounded-sm">
          <p className="text-sm font-medium text-brand-navy">Package options</p>
          {config.bundleGroups.map((group) => (
            <div key={group.groupKey}>
              <label className="text-xs text-brand-silver block mb-1">{group.label}</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm"
                value={bundleChoices[group.groupKey] || ""}
                onChange={(e) =>
                  setBundleChoices((prev) => ({ ...prev, [group.groupKey]: e.target.value }))
                }
              >
                {group.options.map((opt) => (
                  <option key={opt.bundleItemId} value={opt.productId}>
                    {opt.name}
                    {opt.price != null ? ` — ${formatPrice(opt.price)}` : ""}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {config.variants.length > 0 && (
        <div>
          <label className="text-sm font-medium text-brand-navy block mb-2">Option</label>
          <select
            className="w-full max-w-md px-3 py-2.5 border border-gray-200 rounded-sm text-sm"
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
          >
            <option value="">Select option</option>
            {config.variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
                {v.price != null ? ` — ${formatPrice(v.price)}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <p className="text-xs text-brand-silver">GST {config.gstRate}% applies at checkout</p>

      <Button
        onClick={handleAdd}
        disabled={config.variants.length > 0 && !variantId}
      >
        <ShoppingCart className="w-4 h-4" />
        Add to Cart
        {unitPrice != null && ` — ${formatPrice(unitPrice)}`}
      </Button>
    </div>
  );
}
