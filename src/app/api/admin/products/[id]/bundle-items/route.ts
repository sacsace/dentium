import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const items = await prisma.productBundleItem.findMany({
    where: { bundleProductId: id },
    include: { componentProduct: { select: { id: true, name: true, slug: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(items);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bundleProductId } = await params;
  const { items } = await req.json();

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "items array required" }, { status: 400 });
  }

  await prisma.productBundleItem.deleteMany({ where: { bundleProductId } });

  const created = await prisma.$transaction(
    items.map(
      (
        item: {
          componentProductId?: string;
          quantity?: number;
          optionGroup?: string;
          sortOrder?: number;
        },
        index: number
      ) =>
        prisma.productBundleItem.create({
          data: {
            bundleProductId,
            componentProductId: String(item.componentProductId),
            quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
            optionGroup: item.optionGroup?.trim() || null,
            sortOrder: item.sortOrder ?? index,
          },
        })
    )
  );

  return NextResponse.json(created);
}
