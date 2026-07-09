import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { couponsToCsv } from "@/lib/bulk-coupon-import";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const csv = couponsToCsv(coupons);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="coupons-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
