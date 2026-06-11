import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import slugify from "slugify";
import { resolveFeaturedImageForSave } from "@/lib/post-images";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const slug = data.slug || slugify(data.title, { lower: true, strict: true });

  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content || "",
      featuredImage: resolveFeaturedImageForSave(data),
      type: data.type || "BLOG",
      status: data.status || "DRAFT",
      isFeatured: data.isFeatured ?? false,
      isPopular: data.isPopular ?? false,
      tags: data.tags || [],
      authorName: data.authorName || "Admin",
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    },
  });

  return NextResponse.json(post);
}
