import { sendMail } from "@/lib/mail";
import { formatPrice } from "@/lib/utils";
import { SITE_URL } from "@/lib/seo";

type QuoteLine = {
  productName: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
};

export async function sendQuoteEmail(options: {
  to: string;
  customerName: string;
  quoteNumber: string;
  lines: QuoteLine[];
  totalAmount: number;
  message?: string | null;
}) {
  const { to, customerName, quoteNumber, lines, totalAmount, message } = options;
  const lineRows = lines
    .map(
      (l) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${l.productName}</td>` +
        `<td style="padding:8px;border-bottom:1px solid #eee">${l.sku || "—"}</td>` +
        `<td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${l.quantity}</td>` +
        `<td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatPrice(l.unitPrice)}</td>` +
        `<td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatPrice(l.unitPrice * l.quantity)}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#1a1a2e">Your Quote from Dentium</h2>
      <p>Dear ${customerName},</p>
      <p>Thank you for your quote request. Please find your quotation details below.</p>
      <p><strong>Quote #:</strong> ${quoteNumber}</p>
      ${message ? `<p><strong>Notes:</strong> ${message}</p>` : ""}
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
        <thead><tr style="background:#f5f5f5">
          <th style="padding:8px;text-align:left">Product</th>
          <th style="padding:8px;text-align:left">SKU</th>
          <th style="padding:8px;text-align:right">Qty</th>
          <th style="padding:8px;text-align:right">Unit</th>
          <th style="padding:8px;text-align:right">Total</th>
        </tr></thead>
        <tbody>${lineRows}</tbody>
        <tfoot><tr>
          <td colspan="4" style="padding:12px 8px;text-align:right;font-weight:bold">Grand Total</td>
          <td style="padding:12px 8px;text-align:right;font-weight:bold;color:#2d6a4f">${formatPrice(totalAmount)}</td>
        </tr></tfoot>
      </table>
      <p>To proceed, log in to your account or contact our sales team.</p>
      <p><a href="${SITE_URL}/account" style="display:inline-block;background:#c5e86c;color:#1a1a2e;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:600">View Account</a></p>
      <p style="color:#888;font-size:12px;margin-top:24px">Dentium India</p>
    </div>
  `;

  const text = `Dear ${customerName},\n\nYour quote ${quoteNumber} total: ${formatPrice(totalAmount)}\n\nView: ${SITE_URL}/account`;

  await sendMail({
    to,
    subject: `Your Dentium Quote — ${quoteNumber}`,
    text,
    html,
  });
}

export async function sendAccountApprovedEmail(options: { to: string; name: string }) {
  const { to, name } = options;
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#1a1a2e">Account Approved</h2>
      <p>Dear ${name},</p>
      <p>Your Dentium account has been approved as an <strong>Associate Member</strong>. You can log in to browse products and manage your profile.</p>
      <p>To view prices and place orders, complete your company details, upload your dental license, and apply for <strong>Full Membership</strong> from My Account.</p>
      <p><a href="${SITE_URL}/auth/login" style="display:inline-block;background:#c5e86c;color:#1a1a2e;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:600">Log In</a></p>
      <p style="color:#888;font-size:12px;margin-top:24px">Dentium India</p>
    </div>
  `;

  await sendMail({
    to,
    subject: "Your Dentium account has been approved",
    text: `Dear ${name},\n\nYour Associate Member account has been approved. Log in at ${SITE_URL}/auth/login\n\nApply for Full Membership in My Account to view prices and order.`,
    html,
  });
}

export async function sendFullMemberApprovedEmail(options: { to: string; name: string }) {
  const { to, name } = options;
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#1a1a2e">Full Membership Approved</h2>
      <p>Dear ${name},</p>
      <p>Your <strong>Full Membership</strong> application has been approved. You can now view product prices and place orders on Dentium.</p>
      <p><a href="${SITE_URL}/shop" style="display:inline-block;background:#c5e86c;color:#1a1a2e;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:600">Browse Shop</a></p>
      <p style="color:#888;font-size:12px;margin-top:24px">Dentium India</p>
    </div>
  `;

  await sendMail({
    to,
    subject: "Your Dentium Full Membership has been approved",
    text: `Dear ${name},\n\nYour Full Membership is approved. Shop at ${SITE_URL}/shop`,
    html,
  });
}
