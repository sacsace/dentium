import { prisma } from "@/lib/prisma";
import { sendBulkMail } from "@/lib/mail";
import { buildNewsletterHtml, htmlToPlainText } from "@/lib/newsletter-mail";
import { SITE_URL } from "@/lib/seo";
import type { Post } from "@prisma/client";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function notifySubscribersOnBlogPublish(post: Post) {
  const settings = await prisma.siteSettings.findFirst({ where: { id: "default" } });
  if (!settings?.blogNotifyOnPublish) return { skipped: true, reason: "disabled" };

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    select: { email: true },
  });
  if (subscribers.length === 0) return { skipped: true, reason: "no_subscribers" };

  const siteName = settings.siteName || "Dentium";
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const label = post.type === "NEWS" ? "News" : "Blog";
  const subject = `New ${label}: ${post.title}`;
  const excerpt = post.excerpt || post.content.replace(/<[^>]+>/g, " ").slice(0, 200);

  const messageHtml = `
    <p>We've published a new ${label.toLowerCase()} article you may find interesting.</p>
    <h2 style="color:#1a2744;margin:16px 0 8px;">${escapeHtml(post.title)}</h2>
    <p style="color:#555;">${escapeHtml(excerpt)}</p>
    <p><a href="${postUrl}" style="display:inline-block;background:#acc90e;color:#1a2744;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:600">Read Article</a></p>
  `;

  const html = buildNewsletterHtml({ messageHtml, siteName });
  const text = htmlToPlainText(messageHtml);

  const result = await sendBulkMail(
    subscribers.map((s) => s.email),
    { subject, text, html }
  );

  return { skipped: false, sent: result.sent, failed: result.failed.length, total: subscribers.length };
}
