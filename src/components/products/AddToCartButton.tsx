"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart";
import type { ClientProduct } from "@/lib/product-client";
import { getCartUnitPrice } from "@/lib/product-client";

interface Props {
  product: Pick<ClientProduct, "id" | "name" | "slug" | "images" | "price" | "showPrice">;
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
          price: getCartUnitPrice(product, "full"),
        })
      }
    >
      <ShoppingCart className="w-4 h-4" />
      Add to Cart
    </Button>
  );
}
