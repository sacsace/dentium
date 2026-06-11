import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      shortDesc: data.shortDesc,
      sku: data.sku,
      price: data.price ? parseFloat(data.price) : null,
      showPrice: data.showPrice,
      brand: data.brand,
      tags: data.tags,
      images: data.images,
      specifications: data.specifications,
      features: data.features,
      isFeatured: data.isFeatured,
      isNew: data.isNew,
      isActive: data.isActive,
      categoryId: data.categoryId,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      _count: { select: { orderItems: true, quoteItems: true } },
    },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (product._count.orderItems > 0) {
    return NextResponse.json(
      {
        error: `"${product.name}" cannot be deleted because it is linked to ${product._count.orderItems} order(s). Deactivate the product instead.`,
      },
      { status: 409 }
    );
  }

  await prisma.$transaction([
    prisma.quoteItem.deleteMany({ where: { productId: id } }),
    prisma.product.delete({ where: { id } }),
  ]);

  return NextResponse.json({ success: true });
}
