import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sendBulkMail, formatSmtpError } from "@/lib/mail";
import { buildNewsletterHtml, htmlToPlainText, isRichTextEmpty } from "@/lib/newsletter-mail";

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!subject) {
    return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  }
  if (!message || isRichTextEmpty(message)) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    select: { email: true },
    orderBy: { subscribedAt: "asc" },
  });

  if (subscribers.length === 0) {
    return NextResponse.json({ error: "No active subscribers to send to." }, { status: 400 });
  }

  const settings = await prisma.siteSettings.findFirst({ where: { id: "default" } });
  const siteName = settings?.siteName || "Dentium";
  const html = buildNewsletterHtml({ messageHtml: message, siteName });
  const text = htmlToPlainText(message);

  try {
    const result = await sendBulkMail(
      subscribers.map((s) => s.email),
      { subject, text, html }
    );

    if (result.sent === 0) {
      return NextResponse.json(
        {
          error: result.failed[0]?.error || "Failed to send newsletter.",
          sent: 0,
          failed: result.failed.length,
          total: subscribers.length,
          errors: result.failed.slice(0, 10),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sent: result.sent,
      failed: result.failed.length,
      total: subscribers.length,
      errors: result.failed.slice(0, 10),
    });
  } catch (err) {
    const msg = formatSmtpError(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
