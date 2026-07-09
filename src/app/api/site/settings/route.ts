import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SEARCH_SUGGESTIONS } from "@/lib/site-search";

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      where: { id: "default" },
      select: {
        siteName: true,
        contactPhone: true,
        contactEmail: true,
        whatsappNumber: true,
        whatsappMessage: true,
        searchSuggestions: true,
      },
    });

    return NextResponse.json({
      siteName: settings?.siteName || "Dentium",
      contactPhone: settings?.contactPhone || null,
      contactEmail: settings?.contactEmail || null,
      whatsappNumber: settings?.whatsappNumber || null,
      whatsappMessage: settings?.whatsappMessage || "Hello, I have a question about Dentium products.",
      searchSuggestions:
        settings?.searchSuggestions?.length ? settings.searchSuggestions : DEFAULT_SEARCH_SUGGESTIONS,
    });
  } catch {
    return NextResponse.json({
      siteName: "Dentium",
      contactPhone: null,
      contactEmail: null,
      whatsappNumber: null,
      whatsappMessage: "Hello, I have a question about Dentium products.",
      searchSuggestions: DEFAULT_SEARCH_SUGGESTIONS,
    });
  }
}
