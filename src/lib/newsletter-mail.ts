function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isRichTextEmpty(html: string): boolean {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return !text;
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildNewsletterHtml(options: {
  messageHtml: string;
  siteName: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="border-bottom: 3px solid #c5d926; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 20px; color: #1a2744;">${escapeHtml(options.siteName)}</h1>
  </div>
  <div>${options.messageHtml}</div>
  <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
  <p style="font-size: 12px; color: #888;">You received this email because you subscribed to our newsletter.</p>
</body>
</html>`;
}
