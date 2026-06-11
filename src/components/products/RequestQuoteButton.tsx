"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart";
import { useRouter } from "next/navigation";

interface Props {
  productId: string;
  productName: string;
}

export function RequestQuoteButton({ productId, productName }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={() => {
        addItem({
          productId,
          name: productName,
          slug: "",
          image: "",
          price: null,
        });
        router.push("/shop/cart?quote=true");
      }}
    >
      <FileText className="w-4 h-4" />
      Request Quote
    </Button>
  );
}
