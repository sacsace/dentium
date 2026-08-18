"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/admin/AdminForm";

type VariantRow = { name: string; sku: string; price: string; isActive: boolean };
type BundleRow = { componentProductId: string; quantity: string; optionGroup: string };

type ProductOption = { id: string; name: string };

export function ProductCommercePanel({
  productId,
  productType,
}: {
  productId: string;
  productType: string;
}) {
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [bundleItems, setBundleItems] = useState<BundleRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((list) => {
        if (Array.isArray(list)) {
          setProducts(list.filter((p: { id: string }) => p.id !== productId).map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })));
        }
      });

    fetch(`/api/admin/products/${productId}/variants`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) =>
        setVariants(
          rows.map((v: { name: string; sku: string | null; price: unknown; isActive: boolean }) => ({
            name: v.name,
            sku: v.sku || "",
            price: v.price != null ? String(v.price) : "",
            isActive: v.isActive,
          }))
        )
      );

    if (productType === "BUNDLE") {
      fetch(`/api/admin/products/${productId}/bundle-items`)
        .then((r) => (r.ok ? r.json() : []))
        .then((rows) =>
          setBundleItems(
            rows.map((i: { componentProductId: string; quantity: number; optionGroup: string | null }) => ({
              componentProductId: i.componentProductId,
              quantity: String(i.quantity),
              optionGroup: i.optionGroup || "",
            }))
          )
        );
    }
  }, [productId, productType]);

  const saveVariants = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/admin/products/${productId}/variants`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variants }),
    });
    setSaving(false);
    setMessage(res.ok ? "Variants saved." : "Failed to save variants.");
  };

  const saveBundle = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/admin/products/${productId}/bundle-items`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: bundleItems.filter((i) => i.componentProductId),
      }),
    });
    setSaving(false);
    setMessage(res.ok ? "Bundle items saved." : "Failed to save bundle items.");
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 space-y-6">
      <h4 className="font-semibold text-brand-navy">Options & Package</h4>

      {productType !== "BUNDLE" && (
        <div className="space-y-3">
          <p className="text-sm text-brand-silver">Product variants (size, type, etc.)</p>
          {variants.map((row, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input className={inputClass} placeholder="Name" value={row.name} onChange={(e) => {
                const next = [...variants];
                next[index] = { ...row, name: e.target.value };
                setVariants(next);
              }} />
              <input className={inputClass} placeholder="SKU" value={row.sku} onChange={(e) => {
                const next = [...variants];
                next[index] = { ...row, sku: e.target.value };
                setVariants(next);
              }} />
              <input className={inputClass} placeholder="Price" type="number" value={row.price} onChange={(e) => {
                const next = [...variants];
                next[index] = { ...row, price: e.target.value };
                setVariants(next);
              }} />
              <Button type="button" variant="ghost" size="sm" onClick={() => setVariants(variants.filter((_, i) => i !== index))}>
                Remove
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setVariants([...variants, { name: "", sku: "", price: "", isActive: true }])}>
              Add variant
            </Button>
            <Button type="button" size="sm" onClick={saveVariants} disabled={saving}>
              Save variants
            </Button>
          </div>
        </div>
      )}

      {productType === "BUNDLE" && (
        <div className="space-y-3">
          <p className="text-sm text-brand-silver">Bundle components. Use the same option group name for mutually exclusive choices.</p>
          {bundleItems.map((row, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <select className={inputClass} value={row.componentProductId} onChange={(e) => {
                const next = [...bundleItems];
                next[index] = { ...row, componentProductId: e.target.value };
                setBundleItems(next);
              }}>
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input className={inputClass} placeholder="Qty" type="number" value={row.quantity} onChange={(e) => {
                const next = [...bundleItems];
                next[index] = { ...row, quantity: e.target.value };
                setBundleItems(next);
              }} />
              <input className={inputClass} placeholder="Option group" value={row.optionGroup} onChange={(e) => {
                const next = [...bundleItems];
                next[index] = { ...row, optionGroup: e.target.value };
                setBundleItems(next);
              }} />
              <Button type="button" variant="ghost" size="sm" onClick={() => setBundleItems(bundleItems.filter((_, i) => i !== index))}>
                Remove
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setBundleItems([...bundleItems, { componentProductId: "", quantity: "1", optionGroup: "" }])}>
              Add component
            </Button>
            <Button type="button" size="sm" onClick={saveBundle} disabled={saving}>
              Save bundle
            </Button>
          </div>
        </div>
      )}

      {message && <p className="text-sm text-brand-deep">{message}</p>}
    </div>
  );
}
