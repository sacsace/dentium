import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const promotions = await prisma.promotion.findMany({
    include: {
      buyProduct: { select: { name: true, slug: true } },
      getProduct: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(promotions);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  if (!data.title || !data.buyProductId || !data.getProductId) {
    return NextResponse.json({ error: "Title and products are required" }, { status: 400 });
  }

  const promotion = await prisma.promotion.create({
    data: {
      title: data.title,
      buyProductId: data.buyProductId,
      getProductId: data.getProductId,
      buyQuantity: Number(data.buyQuantity) > 0 ? Number(data.buyQuantity) : 1,
      getQuantity: Number(data.getQuantity) > 0 ? Number(data.getQuantity) : 1,
      startsAt: data.startsAt ? new Date(data.startsAt) : new Date(),
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      isActive: data.isActive ?? true,
      excludeCoupons: data.excludeCoupons ?? true,
    },
    include: {
      buyProduct: { select: { name: true } },
      getProduct: { select: { name: true } },
    },
  });

  return NextResponse.json(promotion, { status: 201 });
}
