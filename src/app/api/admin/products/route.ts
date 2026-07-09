import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import slugify from "slugify";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const slug = data.slug || slugify(data.name, { lower: true, strict: true });

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description || "",
        shortDesc: data.shortDesc,
        sku: data.sku,
        price: data.price ? parseFloat(data.price) : null,
        showPrice: data.showPrice ?? false,
        brand: data.brand,
        tags: data.tags || [],
        images: data.images || [],
        specifications: data.specifications || {},
        features: data.features || [],
        isFeatured: data.isFeatured ?? false,
        isNew: data.isNew ?? false,
        isActive: data.isActive ?? true,
        productType: data.productType === "BUNDLE" ? "BUNDLE" : "SIMPLE",
        gstRate: data.gstRate != null && data.gstRate !== "" ? parseFloat(data.gstRate) : 18,
        categoryId: data.categoryId,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
