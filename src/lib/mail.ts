import dns from "dns";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { prisma } from "@/lib/prisma";

dns.setDefaultResultOrder("ipv4first");

type SmtpSettings = NonNullable<Awaited<ReturnType<typeof getSmtpConfig>>>;

const SMTP_HOST_ALIASES: Record<string, string> = {
  "smtp.google.com": "smtp.gmail.com",
};

export async function getSmtpConfig() {
  const settings = await prisma.siteSettings.findFirst({ where: { id: "default" } });
  if (!settings?.smtpHost || !settings.smtpUser || !settings.smtpPass) {
    return null;
  }
  return settings;
}

function normalizeSmtpHost(host: string): string {
  const trimmed = host.trim().toLowerCase();
  return SMTP_HOST_ALIASES[trimmed] ?? trimmed;
}

export { normalizeSmtpHost };

async function resolveSmtpEndpoint(hostname: string): Promise<{ host: string; servername: string }> {
  const servername = normalizeSmtpHost(hostname);
  try {
    const { address } = await dns.promises.lookup(servername, { family: 4 });
    return { host: address, servername };
  } catch {
    return { host: servername, servername };
  }
}

async function createSmtpTransporter(config: SmtpSettings) {
  const { host, servername } = await resolveSmtpEndpoint(config.smtpHost!);

  const options: SMTPTransport.Options = {
    host,
    port: config.smtpPort ?? 587,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser!,
      pass: config.smtpPass!,
    },
    tls: {
      servername,
    },
  };

  return nodemailer.createTransport(options);
}

export function formatSmtpError(err: unknown): string {
  const message = err instanceof Error ? err.message : "Failed to send email";

  if (/ENETUNREACH|ETIMEDOUT|ECONNREFUSED|ENOTFOUND|EHOSTUNREACH/i.test(message)) {
    return "Could not connect to the mail server. Use smtp.gmail.com (not smtp.google.com) for Gmail, port 587, SSL off. Check firewall/network in Admin > Settings.";
  }
  if (/EAUTH|authentication|535|534/i.test(message)) {
    return "SMTP authentication failed. For Gmail, enable 2FA and use an App Password (not your login password).";
  }
  if (/self signed certificate|certificate/i.test(message)) {
    return "SMTP TLS certificate error. Verify host, port, and SSL/TLS settings.";
  }

  return message;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const config = await getSmtpConfig();
  if (!config) {
    throw new Error("SMTP is not configured. Please set up mail settings in Admin > Settings.");
  }

  const transporter = await createSmtpTransporter(config);

  const fromName = config.smtpFromName || config.siteName || "Dentium";
  const fromEmail = config.smtpFromEmail || config.smtpUser!;

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html ?? options.text.replace(/\n/g, "<br>"),
  });
}

export async function sendBulkMail(
  recipients: string[],
  options: {
    subject: string;
    text: string;
    html?: string;
  }
): Promise<{ sent: number; failed: { email: string; error: string }[] }> {
  const config = await getSmtpConfig();
  if (!config) {
    throw new Error("SMTP is not configured. Please set up mail settings in Admin > Settings.");
  }

  const transporter = await createSmtpTransporter(config);

  const fromName = config.smtpFromName || config.siteName || "Dentium";
  const fromEmail = config.smtpFromEmail || config.smtpUser!;
  const html = options.html ?? options.text.replace(/\n/g, "<br>");

  const failed: { email: string; error: string }[] = [];
  let sent = 0;

  for (const to of recipients) {
    try {
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject: options.subject,
        text: options.text,
        html,
      });
      sent++;
    } catch (err) {
      failed.push({
        email: to,
        error: formatSmtpError(err),
      });
    }
  }

  return { sent, failed };
}

export async function testSmtpConnection() {
  const config = await getSmtpConfig();
  if (!config) {
    throw new Error("SMTP is not configured.");
  }

  const transporter = await createSmtpTransporter(config);
  await transporter.verify();
}
