import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashResetToken, validateNewPassword } from "@/lib/password-reset";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`reset-password:${ip}`, 10, 60 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfter);

  try {
    const body = await req.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const passwordError = validateNewPassword(password);

    if (!token) {
      return NextResponse.json({ error: "The reset link is invalid." }, { status: 400 });
    }
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(token) },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });

    if (!tokenRecord || tokenRecord.usedAt || tokenRecord.expiresAt <= new Date()) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Request a new link." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.passwordResetToken.updateMany({
        where: {
          id: tokenRecord.id,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { usedAt: new Date() },
      });

      if (claimed.count !== 1) throw new Error("RESET_TOKEN_ALREADY_USED");

      await tx.user.update({
        where: { id: tokenRecord.userId },
        data: {
          password: passwordHash,
          sessionVersion: { increment: 1 },
        },
      });

      await tx.passwordResetToken.updateMany({
        where: {
          userId: tokenRecord.userId,
          id: { not: tokenRecord.id },
          usedAt: null,
        },
        data: { usedAt: new Date() },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been changed. You can now log in.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "RESET_TOKEN_ALREADY_USED") {
      return NextResponse.json(
        { error: "This reset link has already been used." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Unable to reset the password." }, { status: 500 });
  }
}
