"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/store/cart";

/** Clears persisted cart when the user logs out or the session expires. */
export function CartAuthSync() {
  const { user, loading } = useAuth();
  const wasLoggedIn = useRef<boolean | null>(null);

  useEffect(() => {
    if (loading) return;

    if (wasLoggedIn.current === true && !user) {
      useCartStore.getState().clearCart();
    }

    wasLoggedIn.current = !!user;
  }, [user, loading]);

  return null;
}

export function clearCartOnLogout() {
  useCartStore.getState().clearCart();
}
