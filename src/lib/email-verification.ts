import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { SITE_URL } from "@/lib/seo";
import { escapeHtml, hashToken } from "@/lib/security";

export const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export async function createEmailVerificationToken(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFY_TTL_MS);

  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({ where: { userId } }),
    prisma.emailVerificationToken.create({
      data: { userId, tokenHash, expiresAt },
    }),
  ]);

  return { token, expiresAt };
}

export async function sendEmailVerificationEmail(options: {
  to: string;
  name: string;
  token: string;
}) {
  const name = escapeHtml(options.name);
  const verifyUrl = `${SITE_URL}/auth/verify-email?token=${encodeURIComponent(options.token)}`;

  await sendMail({
    to: options.to,
    subject: "Verify your Dentium email address",
    text: [
      `Dear ${options.name},`,
      "",
      "Please verify your email address to continue your Dentium registration.",
      `Verify email: ${verifyUrl}`,
      "",
      "This link expires in 24 hours and can only be used once.",
      "If you did not create an account, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
        <h2 style="color:#0a1628">Verify your email</h2>
        <p>Dear ${name},</p>
        <p>Please verify your email address to continue your Dentium registration.</p>
        <p style="margin:28px 0">
          <a href="${verifyUrl}" style="display:inline-block;background:#acc90e;color:#0a1628;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:600">
            Verify Email
          </a>
        </p>
        <p>This link expires in 24 hours and can only be used once.</p>
        <p>If you did not create an account, you can safely ignore this email.</p>
        <p style="color:#888;font-size:12px;margin-top:28px">Dentium India</p>
      </div>
    `,
  });
}

export async function consumeEmailVerificationToken(token: string) {
  const tokenHash = hashToken(token);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true, emailVerifiedAt: true } } },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return null;
  }

  try {
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.emailVerificationToken.updateMany({
        where: { id: record.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });
      if (claimed.count !== 1) throw new Error("VERIFY_TOKEN_ALREADY_USED");

      await tx.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: record.user.emailVerifiedAt ?? new Date() },
      });

      await tx.emailVerificationToken.deleteMany({
        where: { userId: record.userId, id: { not: record.id } },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "VERIFY_TOKEN_ALREADY_USED") {
      return null;
    }
    throw error;
  }

  return record.user;
}
