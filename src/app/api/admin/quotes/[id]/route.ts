import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

const QUOTE_STATUSES: OrderStatus[] = [
  "QUOTE_REQUESTED",
  "QUOTE_SENT",
  "CONFIRMED",
  "CANCELLED",
];

export async function GET(_req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { id: true, name: true, slug: true, sku: true, brand: true } } } },
      user: { select: { id: true, name: true, email: true, phone: true, company: true } },
    },
  });

  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(quote);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const { status } = await req.json();

  if (!QUOTE_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const quote = await prisma.quoteRequest.update({
    where: { id },
    data: { status: status as OrderStatus },
    include: {
      items: { include: { product: { select: { id: true, name: true, slug: true, sku: true, brand: true } } } },
      user: { select: { id: true, name: true, email: true, phone: true, company: true } },
    },
  });

  return NextResponse.json(quote);
}
