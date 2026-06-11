import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { InquiryStatus } from "@prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const inquiry = await prisma.contactInquiry.findUnique({ where: { id } });
  if (!inquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (inquiry.status === InquiryStatus.PENDING) {
    const updated = await prisma.contactInquiry.update({
      where: { id },
      data: { status: InquiryStatus.CONFIRMED },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json(inquiry);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const { status } = await req.json();

  if (!Object.values(InquiryStatus).includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const inquiry = await prisma.contactInquiry.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(inquiry);
}
