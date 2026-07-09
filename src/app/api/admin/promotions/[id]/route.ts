import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  const promotion = await prisma.promotion.update({
    where: { id },
    data: {
      title: data.title,
      buyProductId: data.buyProductId,
      getProductId: data.getProductId,
      buyQuantity: Number(data.buyQuantity) > 0 ? Number(data.buyQuantity) : 1,
      getQuantity: Number(data.getQuantity) > 0 ? Number(data.getQuantity) : 1,
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      isActive: data.isActive,
      excludeCoupons: data.excludeCoupons,
    },
  });
  return NextResponse.json(promotion);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.promotion.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
