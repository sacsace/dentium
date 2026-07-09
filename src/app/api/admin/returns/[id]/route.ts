import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();
  const status = data.status;
  const adminNotes = typeof data.adminNotes === "string" ? data.adminNotes.trim() : undefined;

  const validStatuses = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const request = await prisma.returnRequest.update({
    where: { id },
    data: {
      status,
      adminNotes,
      resolvedAt: ["REJECTED", "COMPLETED"].includes(status) ? new Date() : null,
    },
    include: {
      order: { select: { orderNumber: true } },
      user: { select: { name: true, email: true } },
    },
  });
  return NextResponse.json(request);
}
