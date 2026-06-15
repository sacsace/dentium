"use client";

import { memo } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

interface ProductLikeButtonProps {
  productId: string;
  className?: string;
  iconClassName?: string;
}

export const ProductLikeButton = memo(function ProductLikeButton({
  productId,
  className,
  iconClassName,
}: ProductLikeButtonProps) {
  const router = useRouter();
  const { isLoggedIn, isLiked, toggleLike } = useFavorites();
  const liked = isLiked(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }

    await toggleLike(productId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "p-2 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors z-10",
        className
      )}
      aria-label={liked ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={liked}
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-colors",
          liked ? "fill-red-500 text-red-500" : "text-brand-navy",
          iconClassName
        )}
      />
    </button>
  );
});
