import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { normalizeBannerPayload, type BannerFormState } from "@/lib/banner-form";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const normalized = normalizeBannerPayload((await req.json()) as BannerFormState);
  if ("error" in normalized) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  const banner = await prisma.banner.update({ where: { id }, data: normalized.data });
  return NextResponse.json(banner);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.banner.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
