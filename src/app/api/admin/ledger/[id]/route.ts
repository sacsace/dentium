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

  const validStatuses = ["PENDING", "PROCESSING", "COMPLETED", "REJECTED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const request = await prisma.ledgerRequest.update({
    where: { id },
    data: {
      status,
      adminNotes,
      completedAt: ["COMPLETED", "REJECTED"].includes(status) ? new Date() : null,
    },
    include: { user: { select: { name: true, email: true, company: true } } },
  });
  return NextResponse.json(request);
}
