"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  lineKey: string;
  productId: string;
  variantId?: string | null;
  variantLabel?: string | null;
  name: string;
  slug: string;
  image: string;
  price: number | null;
  quantity: number;
}

export function buildCartLineKey(productId: string, variantId?: string | null): string {
  return variantId ? `${productId}:${variantId}` : productId;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity" | "lineKey">, quantity?: number) => void;
  removeItem: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        const lineKey = buildCartLineKey(item.productId, item.variantId);
        set((state) => {
          const existing = state.items.find((i) => i.lineKey === lineKey);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.lineKey === lineKey ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, lineKey, quantity }] };
        });
      },
      removeItem: (lineKey) => {
        set((state) => ({
          items: state.items.filter((i) => i.lineKey !== lineKey),
        }));
      },
      updateQuantity: (lineKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(lineKey);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.lineKey === lineKey ? { ...i, quantity } : i)),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0),
    }),
    {
      name: "dentium-cart",
      version: 2,
      migrate: (persisted) => {
        const state = persisted as { items?: Array<Record<string, unknown>> };
        if (!state?.items) return persisted as CartStore;
        return {
          items: state.items.map((item) => {
            const productId = String(item.productId || "");
            const variantId = item.variantId ? String(item.variantId) : null;
            return {
              ...item,
              lineKey: item.lineKey
                ? String(item.lineKey)
                : buildCartLineKey(productId, variantId),
              productId,
              variantId,
            };
          }),
        };
      },
    }
  )
);
