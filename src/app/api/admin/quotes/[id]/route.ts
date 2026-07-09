import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";
import { sendQuoteEmail } from "@/lib/transactional-mail";

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
  const { status, items, sendQuoteEmail: shouldSendEmail } = await req.json();

  const existing = await prisma.quoteRequest.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (Array.isArray(items)) {
    for (const item of items) {
      if (!item.id) continue;
      const unitPrice = item.unitPrice != null && item.unitPrice !== "" ? Number(item.unitPrice) : null;
      await prisma.quoteItem.update({
        where: { id: item.id },
        data: { unitPrice: unitPrice != null && !Number.isNaN(unitPrice) ? unitPrice : null },
      });
    }
  }

  let totalAmount: number | null = null;
  const updatedItems = await prisma.quoteItem.findMany({
    where: { quoteRequestId: id },
    include: { product: { select: { name: true, sku: true } } },
  });

  for (const item of updatedItems) {
    if (item.unitPrice != null) {
      totalAmount = (totalAmount ?? 0) + Number(item.unitPrice) * item.quantity;
    }
  }

  const nextStatus = status && QUOTE_STATUSES.includes(status) ? (status as OrderStatus) : existing.status;
  const sendingQuote = shouldSendEmail === true && totalAmount != null && totalAmount > 0;

  const quote = await prisma.quoteRequest.update({
    where: { id },
    data: {
      status: sendingQuote ? "QUOTE_SENT" : nextStatus,
      totalAmount: totalAmount != null && totalAmount > 0 ? totalAmount : null,
      quotedAt: sendingQuote ? new Date() : existing.quotedAt,
    },
    include: {
      items: { include: { product: { select: { id: true, name: true, slug: true, sku: true, brand: true } } } },
      user: { select: { id: true, name: true, email: true, phone: true, company: true } },
    },
  });

  if (sendingQuote) {
    try {
      await sendQuoteEmail({
        to: quote.email,
        customerName: quote.name,
        quoteNumber: quote.quoteNumber,
        lines: quote.items
          .filter((i) => i.unitPrice != null)
          .map((i) => ({
            productName: i.product.name,
            sku: i.product.sku,
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice),
          })),
        totalAmount: Number(quote.totalAmount),
        message: quote.message,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send email";
      return NextResponse.json({ error: message, quote }, { status: 500 });
    }
  }

  return NextResponse.json(quote);
}
