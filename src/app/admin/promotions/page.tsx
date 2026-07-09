"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FormField, inputClass } from "@/components/admin/AdminForm";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";

type Product = { id: string; name: string };
type Promotion = {
  id: string;
  title: string;
  buyProductId: string;
  getProductId: string;
  buyQuantity: number;
  getQuantity: number;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
  excludeCoupons: boolean;
  buyProduct: { name: string };
  getProduct: { name: string };
};

const EMPTY = {
  title: "",
  buyProductId: "",
  getProductId: "",
  buyQuantity: "1",
  getQuantity: "1",
  startsAt: "",
  endsAt: "",
  isActive: true,
  excludeCoupons: true,
};

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const { confirm } = useConfirmDialog();

  const load = () => {
    fetch("/api/admin/promotions").then((r) => r.json()).then(setPromotions);
    fetch("/api/admin/products").then((r) => r.json()).then(setProducts);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm(EMPTY);
      load();
    }
  };

  const toggleActive = async (promo: Promotion) => {
    await fetch(`/api/admin/promotions/${promo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...promo, isActive: !promo.isActive }),
    });
    load();
  };

  const remove = async (promo: Promotion) => {
    const ok = await confirm({ title: "Delete promotion", message: `Delete "${promo.title}"?` });
    if (!ok) return;
    await fetch(`/api/admin/promotions/${promo.id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <AdminPageHeader
        title="Promotions"
        description="1+1 (BOGO) offers. Promotions with “exclude coupons” block coupon stacking at checkout."
        action={
          <Button type="button" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4" /> Add Promotion
          </Button>
        }
      />

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-sm shadow-sm mb-8 space-y-4 max-w-2xl">
          <FormField label="Title">
            <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Buy product">
              <select required className={inputClass} value={form.buyProductId} onChange={(e) => setForm({ ...form, buyProductId: e.target.value })}>
                <option value="">Select</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </FormField>
            <FormField label="Get product (free/discounted)">
              <select required className={inputClass} value={form.getProductId} onChange={(e) => setForm({ ...form, getProductId: e.target.value })}>
                <option value="">Select</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <FormField label="Buy qty">
              <input type="number" min="1" className={inputClass} value={form.buyQuantity} onChange={(e) => setForm({ ...form, buyQuantity: e.target.value })} />
            </FormField>
            <FormField label="Get qty">
              <input type="number" min="1" className={inputClass} value={form.getQuantity} onChange={(e) => setForm({ ...form, getQuantity: e.target.value })} />
            </FormField>
            <FormField label="Starts">
              <input type="date" className={inputClass} value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
            </FormField>
            <FormField label="Ends">
              <input type="date" className={inputClass} value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.excludeCoupons} onChange={(e) => setForm({ ...form, excludeCoupons: e.target.checked })} />
            Block coupon codes while this promotion applies
          </label>
          <Button type="submit">Create promotion</Button>
        </form>
      )}

      <div className="bg-white rounded-sm shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-brand-gray text-left">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Buy</th>
              <th className="px-4 py-3">Get</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {promotions.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3">{p.title}</td>
                <td className="px-4 py-3">{p.buyProduct.name}</td>
                <td className="px-4 py-3">{p.getProduct.name}</td>
                <td className="px-4 py-3">{p.buyQuantity}+{p.getQuantity}</td>
                <td className="px-4 py-3">{p.isActive ? "Active" : "Inactive"}</td>
                <td className="px-4 py-3 space-x-2">
                  <Button type="button" size="sm" variant="ghost" onClick={() => toggleActive(p)}>
                    {p.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => remove(p)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
