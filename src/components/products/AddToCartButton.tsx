"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart";

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    price: unknown;
    showPrice: boolean;
  };
}

export function AddToCartButton({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <Button
      onClick={() =>
        addItem({
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images[0] || "",
          price: product.showPrice ? Number(product.price) : null,
        })
      }
    >
      <ShoppingCart className="w-4 h-4" />
      Add to Cart
    </Button>
  );
}
