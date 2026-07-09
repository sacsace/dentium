import { prisma } from "@/lib/prisma";
import { sendBulkMail } from "@/lib/mail";
import { formatPrice } from "@/lib/utils";
import { SITE_URL } from "@/lib/seo";
import type { CouponEmailCampaign, CouponEmailSegment, UserRole } from "@prisma/client";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildCouponEmailHtml(options: {
  siteName: string;
  couponCode: string;
  description?: string | null;
  discountLabel: string;
  expiresAt?: Date | null;
  message?: string | null;
}) {
  const expiry = options.expiresAt
    ? options.expiresAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "No expiry";

  return `<!DOCTYPE html>
<html lang="en">
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #1a2744;">Your exclusive coupon from ${escapeHtml(options.siteName)}</h2>
  ${options.message ? `<p>${escapeHtml(options.message)}</p>` : ""}
  <div style="background: #f5f7f0; border: 2px dashed #acc90e; padding: 20px; text-align: center; margin: 24px 0; border-radius: 8px;">
    <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #666;">Coupon Code</p>
    <p style="margin: 0; font-size: 28px; font-weight: bold; color: #1a2744; letter-spacing: 0.15em;">${escapeHtml(options.couponCode)}</p>
    <p style="margin: 12px 0 0; font-size: 14px; color: #444;">${escapeHtml(options.discountLabel)}</p>
  </div>
  <p><strong>Valid until:</strong> ${expiry}</p>
  ${options.description ? `<p>${escapeHtml(options.description)}</p>` : ""}
  <p>Apply this code at checkout on our B2B shop.</p>
  <p><a href="${SITE_URL}/shop/cart" style="display:inline-block;background:#acc90e;color:#1a2744;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:600">Shop Now</a></p>
</body>
</html>`;
}

export function formatCouponDiscount(coupon: { discountType: string; discountValue: unknown }): string {
  const value = Number(coupon.discountValue);
  if (coupon.discountType === "PERCENT") return `${value}% off your order`;
  return `${formatPrice(value)} off your order`;
}

export async function resolveCampaignRecipients(
  segment: CouponEmailSegment,
  userIds: string[]
): Promise<{ email: string; name: string }[]> {
  const userRole: UserRole = "USER";

  if (segment === "SPECIFIC_USERS" && userIds.length > 0) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds }, isActive: true },
      select: { email: true, name: true },
    });
    return users;
  }

  if (segment === "ACTIVE_USERS") {
    const users = await prisma.user.findMany({
      where: { role: userRole, isActive: true },
      select: { email: true, name: true },
    });
    return users;
  }

  const users = await prisma.user.findMany({
    where: { role: userRole },
    select: { email: true, name: true },
  });
  return users;
}

export async function sendCouponCampaign(campaignId: string) {
  const campaign = await prisma.couponEmailCampaign.findUnique({
    where: { id: campaignId },
    include: { coupon: true },
  });
  if (!campaign) throw new Error("Campaign not found");
  if (campaign.status === "SENT") throw new Error("Campaign already sent");
  if (!campaign.coupon.isActive) throw new Error("Coupon is not active");

  await prisma.couponEmailCampaign.update({
    where: { id: campaignId },
    data: { status: "SENDING" },
  });

  const recipients = await resolveCampaignRecipients(campaign.segment, campaign.userIds);
  if (recipients.length === 0) {
    await prisma.couponEmailCampaign.update({
      where: { id: campaignId },
      data: { status: "FAILED", failedCount: 0, sentCount: 0 },
    });
    throw new Error("No recipients found for this segment");
  }

  const settings = await prisma.siteSettings.findFirst({ where: { id: "default" } });
  const siteName = settings?.siteName || "Dentium";
  const discountLabel = formatCouponDiscount(campaign.coupon);
  const html = buildCouponEmailHtml({
    siteName,
    couponCode: campaign.coupon.code,
    description: campaign.coupon.description,
    discountLabel,
    expiresAt: campaign.coupon.expiresAt,
    message: campaign.message,
  });
  const text = `Your coupon code: ${campaign.coupon.code}\n${discountLabel}\nShop: ${SITE_URL}/shop/cart`;

  const result = await sendBulkMail(
    recipients.map((r) => r.email),
    { subject: campaign.subject, text, html }
  );

  await prisma.couponEmailCampaign.update({
    where: { id: campaignId },
    data: {
      status: result.sent > 0 ? "SENT" : "FAILED",
      sentAt: new Date(),
      sentCount: result.sent,
      failedCount: result.failed.length,
    },
  });

  return { sent: result.sent, failed: result.failed.length, total: recipients.length };
}

export async function processDueCouponCampaigns() {
  const due = await prisma.couponEmailCampaign.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: new Date() },
    },
    take: 5,
  });

  const results: { id: string; ok: boolean; error?: string }[] = [];
  for (const campaign of due) {
    try {
      await sendCouponCampaign(campaign.id);
      results.push({ id: campaign.id, ok: true });
    } catch (err) {
      results.push({
        id: campaign.id,
        ok: false,
        error: err instanceof Error ? err.message : "Send failed",
      });
    }
  }
  return results;
}

export type CampaignWithCoupon = CouponEmailCampaign & {
  coupon: { code: string; discountType: string; discountValue: unknown };
};
