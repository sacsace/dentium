import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const withProducts = req.nextUrl.searchParams.get("detail") === "1";

  if (!withProducts) {
    const likes = await prisma.productLike.findMany({
      where: { userId: session.id },
      select: { productId: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ productIds: likes.map((like) => like.productId) });
  }

  const likes = await prisma.productLike.findMany({
    where: { userId: session.id },
    include: {
      product: {
        include: { category: { select: { name: true, slug: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    products: likes.map((like) => like.product).filter((product) => product.isActive),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const existing = await prisma.productLike.findUnique({
    where: { userId_productId: { userId: session.id, productId } },
  });

  if (existing) {
    await prisma.productLike.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }

  await prisma.productLike.create({
    data: { userId: session.id, productId },
  });

  return NextResponse.json({ liked: true });
}
