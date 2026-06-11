import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import slugify from "slugify";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const events = await prisma.event.findMany({ orderBy: { startDate: "desc" } });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const slug = data.slug || slugify(data.title, { lower: true, strict: true });

  const event = await prisma.event.create({
    data: {
      title: data.title,
      slug,
      description: data.description || "",
      excerpt: data.excerpt,
      featuredImage: data.featuredImage,
      location: data.location,
      venue: data.venue,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      status: data.status || "UPCOMING",
      isFeatured: data.isFeatured ?? false,
      registrationUrl: data.registrationUrl,
    },
  });

  return NextResponse.json(event);
}
