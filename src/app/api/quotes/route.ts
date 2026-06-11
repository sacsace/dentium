import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateQuoteNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const { name, email, phone, company, message, items } = await req.json();

    if (!name || !email || !items?.length) {
      return NextResponse.json({ error: "Name, email, and items are required" }, { status: 400 });
    }

    const quote = await prisma.quoteRequest.create({
      data: {
        quoteNumber: generateQuoteNumber(),
        userId: session?.id,
        name,
        email,
        phone,
        company,
        message,
        status: "QUOTE_REQUESTED",
        items: {
          create: items.map((item: { productId: string; quantity: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, quoteNumber: quote.quoteNumber });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
