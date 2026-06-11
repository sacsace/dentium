import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sendMail } from "@/lib/mail";
import { InquiryStatus } from "@prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const { subject, message } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "Reply message is required" }, { status: 400 });
  }

  const inquiry = await prisma.contactInquiry.findUnique({ where: { id } });
  if (!inquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const replySubject =
    subject?.trim() ||
    (inquiry.subject ? `Re: ${inquiry.subject}` : "Re: Your inquiry to Dentium");

  try {
    await sendMail({
      to: inquiry.email,
      subject: replySubject,
      text: message.trim(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const updated = await prisma.contactInquiry.update({
    where: { id },
    data: {
      status: InquiryStatus.COMPLETED,
      adminReply: message.trim(),
      repliedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
