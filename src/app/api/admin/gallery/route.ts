import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.galleryImage.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  if (!data.imageUrl?.trim()) {
    return NextResponse.json({ error: "Image is required" }, { status: 400 });
  }

  const item = await prisma.galleryImage.create({
    data: {
      title: data.title?.trim() || null,
      caption: data.caption?.trim() || null,
      imageUrl: data.imageUrl.trim(),
      category: data.category?.trim() || null,
      isActive: data.isActive ?? true,
      sortOrder: Number(data.sortOrder) || 0,
    },
  });

  return NextResponse.json(item);
}
