"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Trash2, Minus, Plus, ArrowLeft, FileText, Tag, X } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDiscountLabel, type DiscountType } from "@/lib/coupon-utils";

type PricingBreakdown = {
  subtotal: number;
  promotionDiscount: number;
  promotionTitle: string | null;
  couponDiscount: number;
  couponCode: string | null;
  freeShipping: boolean;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  couponBlocked: boolean;
  couponBlockedReason: string | null;
};

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const searchParams = useSearchParams();
  const isQuote = searchParams.get("quote") === "true";
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [couponInput, setCouponInput] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  const cartPayload = useMemo(
    () =>
      items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    [items]
  );

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

  useEffect(() => {
    if (isQuote || items.length === 0) {
      setPricing(null);
      return;
    }

    let cancelled = false;
    setPricingLoading(true);
    const timer = window.setTimeout(() => {
      fetch("/api/cart/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartPayload,
          couponCode: appliedCouponCode,
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (cancelled) return;
          if (res.ok) {
            setPricing(data);
            if (appliedCouponCode && !data.couponCode) {
              setCouponError(data.couponBlockedReason || "Coupon could not be applied");
            } else {
              setCouponError("");
            }
          }
        })
        .finally(() => {
          if (!cancelled) setPricingLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [cartPayload, appliedCouponCode, isQuote, items.length]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    setApplyingCoupon(true);
    setCouponError("");
    setAppliedCouponCode(couponInput.trim().toUpperCase());
    setApplyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponCode(null);
    setCouponInput("");
    setCouponError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = isQuote ? "/api/quotes" : "/api/orders";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          couponCode: !isQuote && appliedCouponCode ? appliedCouponCode : undefined,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSubmitted(true);
        clearCart();
        setAppliedCouponCode(null);
      } else {
        alert(data.error || "Failed to submit. Please try again.");
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
                  <div key={item.lineKey} className="flex gap-4 p-4 bg-brand-gray rounded-sm">
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
                        <button type="button" onClick={() => updateQuantity(item.lineKey, item.quantity - 1)} className="p-1 hover:bg-white rounded">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.lineKey, item.quantity + 1)} className="p-1 hover:bg-white rounded">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeItem(item.lineKey)} className="text-brand-silver hover:text-red-500 p-2">
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
                  <textarea
                    placeholder="Additional notes"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-deep resize-none"
                  />

                  {!isQuote && pricing && (
                    <div className="space-y-3 pt-2 border-t">
                      <div>
                        <label className="text-sm font-medium text-brand-navy flex items-center gap-1.5 mb-2">
                          <Tag className="w-4 h-4" /> Coupon Code
                        </label>
                        {appliedCouponCode && pricing.couponCode ? (
                          <div className="flex items-center justify-between gap-2 p-3 bg-white border border-brand-deep/20 rounded-sm">
                            <div>
                              <p className="text-sm font-medium text-brand-navy">{pricing.couponCode}</p>
                              {pricing.freeShipping && (
                                <p className="text-xs text-brand-silver">Free shipping included</p>
                              )}
                            </div>
                            <button type="button" onClick={handleRemoveCoupon} className="p-1 text-brand-silver hover:text-red-500" aria-label="Remove coupon">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              placeholder="Enter code"
                              value={couponInput}
                              onChange={(e) => {
                                setCouponInput(e.target.value.toUpperCase());
                                setCouponError("");
                              }}
                              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-deep uppercase"
                            />
                            <Button type="button" variant="outline" onClick={handleApplyCoupon} disabled={applyingCoupon || pricingLoading}>
                              Apply
                            </Button>
                          </div>
                        )}
                        {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
                        {pricing.couponBlocked && pricing.couponBlockedReason && (
                          <p className="text-xs text-amber-700 mt-1">{pricing.couponBlockedReason}</p>
                        )}
                      </div>

                      {pricing.promotionDiscount > 0 && pricing.promotionTitle && (
                        <p className="text-xs text-green-700">Promotion: {pricing.promotionTitle}</p>
                      )}

                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-brand-silver">Subtotal</span>
                          <span>{formatPrice(pricing.subtotal)}</span>
                        </div>
                        {pricing.promotionDiscount > 0 && (
                          <div className="flex justify-between text-green-700">
                            <span>Promotion</span>
                            <span>-{formatPrice(pricing.promotionDiscount)}</span>
                          </div>
                        )}
                        {pricing.couponDiscount > 0 && (
                          <div className="flex justify-between text-green-700">
                            <span>Coupon</span>
                            <span>-{formatPrice(pricing.couponDiscount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-brand-silver">GST</span>
                          <span>{formatPrice(pricing.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-silver">Shipping</span>
                          <span>{pricing.shippingAmount === 0 ? "Free" : formatPrice(pricing.shippingAmount)}</span>
                        </div>
                        <div className="flex justify-between font-medium pt-1 border-t">
                          <span>Total</span>
                          <span className="text-brand-deep">{formatPrice(pricing.total)}</span>
                        </div>
                      </div>
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
