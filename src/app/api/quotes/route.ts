import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateQuoteNumber } from "@/lib/utils";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { isValidEmail, normalizeEmail } from "@/lib/security";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`quotes:${ip}`, 15, 60 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfter);

  try {
    const session = await getSession();
    const body = await req.json();
    const { name, phone, company, message, items } = body;
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";

    if (!name || !email || !items?.length) {
      return NextResponse.json({ error: "Name, email, and items are required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
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
