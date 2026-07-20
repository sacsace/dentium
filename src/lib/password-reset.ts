import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { SITE_URL } from "@/lib/seo";

export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function validateNewPassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Password must include at least one letter and one number.";
  }
  if (password.length > 128) {
    return "Password must be 128 characters or fewer.";
  }
  return null;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function createPasswordResetToken(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
    prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
    }),
  ]);

  return { token, expiresAt };
}

export async function sendPasswordResetEmail(options: {
  to: string;
  name: string;
  token: string;
}) {
  const name = escapeHtml(options.name);
  const resetUrl = `${SITE_URL}/auth/reset-password?token=${encodeURIComponent(options.token)}`;

  await sendMail({
    to: options.to,
    subject: "Reset your Dentium password",
    text: [
      `Dear ${options.name},`,
      "",
      "We received a request to reset your Dentium password.",
      `Reset your password: ${resetUrl}`,
      "",
      "This link expires in 1 hour and can only be used once.",
      "If you did not request this change, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
        <h2 style="color:#0a1628">Reset your password</h2>
        <p>Dear ${name},</p>
        <p>We received a request to reset your Dentium password.</p>
        <p style="margin:28px 0">
          <a href="${resetUrl}" style="display:inline-block;background:#acc90e;color:#0a1628;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600">
            Reset Password
          </a>
        </p>
        <p>This link expires in 1 hour and can only be used once.</p>
        <p>If you did not request this change, you can safely ignore this email.</p>
        <p style="color:#888;font-size:12px;margin-top:28px">Dentium India</p>
      </div>
    `,
  });
}
