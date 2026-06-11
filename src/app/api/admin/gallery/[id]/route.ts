import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const data = await req.json();

  if (!data.imageUrl?.trim()) {
    return NextResponse.json({ error: "Image is required" }, { status: 400 });
  }

  try {
    const item = await prisma.galleryImage.update({
      where: { id },
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
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  try {
    await prisma.galleryImage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
