"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";

type FavoritesContextValue = {
  isLoggedIn: boolean;
  isLiked: (productId: string) => boolean;
  toggleLike: (productId: string) => Promise<boolean | null>;
  ready: boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLikedIds(new Set());
      setReady(true);
      return;
    }

    let cancelled = false;
    setReady(false);

    fetch("/api/favorites")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.productIds) return;
        setLikedIds(new Set(data.productIds as string[]));
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const isLiked = useCallback((productId: string) => likedIds.has(productId), [likedIds]);

  const toggleLike = useCallback(
    async (productId: string): Promise<boolean | null> => {
      if (!user) return null;

      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (data.liked) next.add(productId);
        else next.delete(productId);
        return next;
      });

      return Boolean(data.liked);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      isLoggedIn: Boolean(user),
      isLiked,
      toggleLike,
      ready,
    }),
    [user, isLiked, toggleLike, ready]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}
