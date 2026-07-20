import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken, sendPasswordResetEmail } from "@/lib/password-reset";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const GENERIC_MESSAGE =
  "If an account exists for that email, password reset instructions have been sent.";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const ipLimit = rateLimit(`forgot-password:ip:${ip}`, 5, 60 * 60 * 1000);
  if (!ipLimit.ok) return rateLimitResponse(ipLimit.retryAfter);

  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const emailKey = createHash("sha256").update(email).digest("hex");
    const emailLimit = rateLimit(`forgot-password:email:${emailKey}`, 3, 60 * 60 * 1000);
    if (!emailLimit.ok) {
      return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, isActive: true },
    });

    if (user?.isActive) {
      const { token } = await createPasswordResetToken(user.id);
      try {
        await sendPasswordResetEmail({ to: user.email, name: user.name, token });
      } catch (error) {
        await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
        console.error("Password reset email failed:", error);
      }
    }

    return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
  } catch {
    return NextResponse.json({ error: "Unable to process the request." }, { status: 500 });
  }
}
