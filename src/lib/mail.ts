import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export async function getSmtpConfig() {
  const settings = await prisma.siteSettings.findFirst({ where: { id: "default" } });
  if (!settings?.smtpHost || !settings.smtpUser || !settings.smtpPass) {
    return null;
  }
  return settings;
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

  const transporter = nodemailer.createTransport({
    host: config.smtpHost!,
    port: config.smtpPort ?? 587,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser!,
      pass: config.smtpPass!,
    },
  });

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

export async function testSmtpConnection() {
  const config = await getSmtpConfig();
  if (!config) {
    throw new Error("SMTP is not configured.");
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost!,
    port: config.smtpPort ?? 587,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser!,
      pass: config.smtpPass!,
    },
  });

  await transporter.verify();
}
