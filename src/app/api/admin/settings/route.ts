import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { normalizeSmtpHost } from "@/lib/mail";

const SETTINGS_FIELDS = [
  "siteName", "tagline", "aboutTitle", "aboutContent", "aboutMission", "aboutVision",
  "contactEmail", "contactPhone", "contactAddress",
  "socialLinkedin", "socialYoutube", "socialTwitter", "socialInstagram",
  "seoTitle", "seoDescription", "seoKeywords", "heroVideoUrl",
  "whatsappNumber", "whatsappMessage", "blogNotifyOnPublish",
  "smtpHost", "smtpPort", "smtpUser", "smtpFromEmail", "smtpFromName", "smtpSecure",
] as const;

function sanitizeSettingsResponse(
  settings: Awaited<ReturnType<typeof prisma.siteSettings.findFirst>> & object
) {
  const { smtpPass, ...rest } = settings as Record<string, unknown>;
  return { ...rest, hasSmtpPass: Boolean(smtpPass) };
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { id: "default", siteName: "Dentium" } });
  }
  return NextResponse.json(sanitizeSettingsResponse(settings));
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const update: Record<string, unknown> = {};

  for (const key of SETTINGS_FIELDS) {
    if (key in data) update[key] = data[key];
  }

  if (typeof data.smtpPass === "string" && data.smtpPass.trim()) {
    update.smtpPass = data.smtpPass.trim();
  }

  if (typeof update.smtpHost === "string" && update.smtpHost.trim()) {
    update.smtpHost = normalizeSmtpHost(update.smtpHost);
  }

  if (Array.isArray(data.searchSuggestions)) {
    update.searchSuggestions = data.searchSuggestions
      .filter((s: unknown) => typeof s === "string" && s.trim())
      .map((s: string) => s.trim());
  } else if (typeof data.searchSuggestionsText === "string") {
    update.searchSuggestions = data.searchSuggestionsText
      .split("\n")
      .map((s: string) => s.trim())
      .filter(Boolean);
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    update,
    create: { id: "default", siteName: "Dentium", ...update },
  });
  return NextResponse.json(sanitizeSettingsResponse(settings));
}
