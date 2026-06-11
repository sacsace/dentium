import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeNewsletterEmail, normalizeNewsletterSource } from "@/lib/newsletter";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`newsletter:${ip}`, 5, 60 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfter);

  try {
    const body = await req.json();
    const email = normalizeNewsletterEmail(body.email);
    if (!email) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const source = normalizeNewsletterSource(body.source);
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });

    if (existing?.isActive) {
      return NextResponse.json({ success: true, message: "You are already subscribed." });
    }

    if (existing) {
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: {
          isActive: true,
          unsubscribedAt: null,
          subscribedAt: new Date(),
          ...(source ? { source } : {}),
        },
      });
      return NextResponse.json({ success: true, message: "Welcome back! You are subscribed again." });
    }

    await prisma.newsletterSubscriber.create({
      data: { email, source: source ?? "website" },
    });

    return NextResponse.json({ success: true, message: "Thank you for subscribing!" });
  } catch {
    return NextResponse.json({ error: "Unable to subscribe right now. Please try again later." }, { status: 500 });
  }
}
