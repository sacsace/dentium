import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const variants = await prisma.productVariant.findMany({
    where: { productId: id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(variants);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: productId } = await params;
  const { variants } = await req.json();

  if (!Array.isArray(variants)) {
    return NextResponse.json({ error: "variants array required" }, { status: 400 });
  }

  await prisma.productVariant.deleteMany({ where: { productId } });

  const created = await prisma.$transaction(
    variants.map((v: { name?: string; sku?: string; price?: string; sortOrder?: number; isActive?: boolean }, index: number) =>
      prisma.productVariant.create({
        data: {
          productId,
          name: String(v.name || `Option ${index + 1}`),
          sku: v.sku || null,
          price: v.price != null && v.price !== "" ? Number(v.price) : null,
          sortOrder: v.sortOrder ?? index,
          isActive: v.isActive ?? true,
        },
      })
    )
  );

  return NextResponse.json(created);
}
