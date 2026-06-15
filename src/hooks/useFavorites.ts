"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function useFavorites() {
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

  return {
    isLoggedIn: Boolean(user),
    isLiked,
    toggleLike,
    ready,
  };
}
