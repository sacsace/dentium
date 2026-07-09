import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const data = await req.json();

  const popup = await prisma.popupBanner.update({
    where: { id },
    data: {
      title: data.title,
      content: data.content || null,
      image: data.image || null,
      videoUrl: data.videoUrl || null,
      contentType: data.contentType || "IMAGE",
      displayTarget: data.displayTarget || "ALL",
      ctaText: data.ctaText || null,
      ctaLink: data.ctaLink || null,
      isActive: data.isActive ?? false,
      sortOrder: data.sortOrder ?? 0,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  });

  return NextResponse.json(popup);
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  await prisma.popupBanner.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
