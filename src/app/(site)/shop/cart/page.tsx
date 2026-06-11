"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Trash2, Minus, Plus, ArrowLeft, FileText } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const searchParams = useSearchParams();
  const isQuote = searchParams.get("quote") === "true";
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.user) return;
        const user = data.user;
        setForm((prev) => ({
          ...prev,
          name: prev.name || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          email: prev.email || user.email || "",
          phone: prev.phone || user.phone || "",
          company: prev.company || user.company || "",
        }));
      })
      .catch(() => undefined);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = isQuote ? "/api/quotes" : "/api/orders";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) }),
      });
      if (res.ok) {
        setSubmitted(true);
        clearCart();
      }
    } catch {
      alert("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <PageHeader title={isQuote ? "Quote Requested" : "Order Submitted"} subtitle="Success" />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="font-display text-2xl text-brand-navy mb-4">
            Thank you for your {isQuote ? "quote request" : "order"}!
          </h2>
          <p className="text-brand-silver mb-8">Our team will contact you shortly.</p>
          <Link href="/products"><Button>Continue Shopping</Button></Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={isQuote ? "Request Quote" : "Shopping Cart"}
        subtitle="Shop"
        description={isQuote ? "Submit a quote request for selected products" : "Review your cart and place an order"}
      />

      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-brand-silver text-lg mb-6">Your cart is empty.</p>
              <Link href="/shop"><Button>Browse Products</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4 p-4 bg-brand-gray rounded-sm">
                    {item.image && (
                      <div className="relative w-20 h-20 shrink-0 rounded-sm overflow-hidden">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-brand-navy">{item.name}</h3>
                      <p className="text-brand-silver text-sm">
                        {item.price ? formatPrice(item.price) : "Price on request"}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1 hover:bg-white rounded">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1 hover:bg-white rounded">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="text-brand-silver hover:text-red-500 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <Link href="/shop" className="inline-flex items-center gap-2 text-brand-deep text-sm mt-4">
                  <ArrowLeft className="w-4 h-4" /> Continue Shopping
                </Link>
              </div>

              <div>
                <form onSubmit={handleSubmit} className="bg-brand-gray p-6 rounded-sm space-y-4 sticky top-28">
                  <h3 className="font-semibold text-brand-navy text-lg">
                    {isQuote ? "Quote Request Details" : "Order Details"}
                  </h3>
                  <input
                    required
                    placeholder="Full Name *"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-deep"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email *"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-deep"
                  />
                  <input
                    placeholder="Phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-deep"
                  />
                  <input
                    placeholder={isQuote ? "Company / Clinic (Optional)" : "Company / Clinic *"}
                    required={!isQuote}
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-deep"
                  />
                  {!isQuote && (
                    <p className="text-xs text-brand-silver -mt-2">
                      Required for orders. You can save it in{" "}
                      <Link href="/account#business-info" className="text-brand-deep hover:underline">
                        My Account
                      </Link>{" "}
                      for next time.
                    </p>
                  )}
                  <textarea
                    placeholder="Additional notes"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-deep resize-none"
                  />

                  {!isQuote && getTotalPrice() > 0 && (
                    <div className="flex justify-between text-sm font-medium pt-2 border-t">
                      <span>Estimated Total</span>
                      <span className="text-brand-deep">{formatPrice(getTotalPrice())}</span>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {isQuote ? (
                      <><FileText className="w-4 h-4" /> Request Quote</>
                    ) : (
                      "Submit Order"
                    )}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
