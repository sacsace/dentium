import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === "string" && id.trim()) : [];

  if (ids.length === 0) {
    return NextResponse.json({ error: "No records selected" }, { status: 400 });
  }

  const result = await prisma.erpCustomerRecord.deleteMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json({ success: true, deleted: result.count });
}
