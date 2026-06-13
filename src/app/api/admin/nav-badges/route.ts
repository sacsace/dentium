import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ORDER_TAB_RECEIVED_STATUSES } from "@/lib/order";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.count({
    where: { status: { in: ORDER_TAB_RECEIVED_STATUSES } },
  });

  return NextResponse.json({ orders });
}
