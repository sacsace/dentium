import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.returnRequest.findMany({
    include: {
      order: { select: { orderNumber: true, status: true, guestName: true } },
      user: { select: { name: true, email: true, company: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}
