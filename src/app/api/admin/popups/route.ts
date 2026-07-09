import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const popups = await prisma.popupBanner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json(popups);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const popup = await prisma.popupBanner.create({
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
