import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      price: true,
      showPrice: true,
      productType: true,
      gstRate: true,
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, sku: true, price: true },
      },
      bundleItems: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          quantity: true,
          optionGroup: true,
          componentProduct: {
            select: { id: true, name: true, slug: true, price: true, images: true },
          },
        },
      },
    },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const bundleGroups = product.productType === "BUNDLE"
    ? Object.entries(
        product.bundleItems.reduce<Record<string, typeof product.bundleItems>>((acc, item) => {
          const key = item.optionGroup || item.id;
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        }, {})
      ).map(([groupKey, items]) => ({
        groupKey,
        label: items[0]?.optionGroup || "Included items",
        required: Boolean(items[0]?.optionGroup),
        options: items.map((i) => ({
          bundleItemId: i.id,
          productId: i.componentProduct.id,
          name: i.componentProduct.name,
          quantity: i.quantity,
          price: i.componentProduct.price != null ? Number(i.componentProduct.price) : null,
          image: i.componentProduct.images[0] || null,
        })),
      }))
    : [];

  return NextResponse.json({
    id: product.id,
    name: product.name,
    slug: product.slug,
    images: product.images,
    price: product.price != null ? Number(product.price) : null,
    showPrice: product.showPrice,
    productType: product.productType,
    gstRate: Number(product.gstRate),
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price != null ? Number(v.price) : null,
    })),
    bundleGroups,
  });
}
