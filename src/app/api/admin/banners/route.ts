import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { normalizeBannerPayload, type BannerFormState } from "@/lib/banner-form";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const normalized = normalizeBannerPayload((await req.json()) as BannerFormState);
  if ("error" in normalized) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  const banner = await prisma.banner.create({ data: normalized.data });
  return NextResponse.json(banner);
}
