import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import slugify from "slugify";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const data = await req.json();
  const slug = data.slug || slugify(data.name, { lower: true, strict: true });

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      description: data.description,
      image: data.image,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      parentId: data.parentId || null,
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return NextResponse.json({ error: "Cannot delete category with products" }, { status: 400 });
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
