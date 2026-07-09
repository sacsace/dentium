import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  if (data.status === "CANCELLED") {
    const campaign = await prisma.couponEmailCampaign.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: { coupon: { select: { code: true } } },
    });
    return NextResponse.json(campaign);
  }

  return NextResponse.json({ error: "Unsupported update" }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.couponEmailCampaign.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
