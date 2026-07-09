import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();

  const popups = await prisma.popupBanner.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      content: true,
      image: true,
      videoUrl: true,
      contentType: true,
      displayTarget: true,
      ctaText: true,
      ctaLink: true,
    },
  });

  return NextResponse.json(popups);
}
