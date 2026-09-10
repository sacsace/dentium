import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createEmailVerificationToken,
  sendEmailVerificationEmail,
} from "@/lib/email-verification";
import { formatSmtpError } from "@/lib/mail";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { assertSameOrigin, isValidEmail, normalizeEmail } from "@/lib/security";

export async function POST(req: NextRequest) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const ip = getClientIp(req);
  const limited = rateLimit(`resend-verify:${ip}`, 5, 60 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfter);

  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const emailLimited = rateLimit(`resend-verify-email:${email}`, 3, 60 * 60 * 1000);
    if (!emailLimited.ok) return rateLimitResponse(emailLimited.retryAfter);

    const user = await prisma.user.findUnique({ where: { email } });
    // Generic response to avoid account enumeration
    const generic = {
      success: true,
      message: "If an unverified account exists for that email, a new verification link has been sent.",
    };

    if (!user || user.emailVerifiedAt) {
      return NextResponse.json(generic);
    }

    try {
      const { token } = await createEmailVerificationToken(user.id);
      await sendEmailVerificationEmail({ to: user.email, name: user.name, token });
    } catch (error) {
      console.error("Resend verification failed:", error);
      return NextResponse.json(
        { error: formatSmtpError(error) },
        { status: 503 }
      );
    }

    return NextResponse.json(generic);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
