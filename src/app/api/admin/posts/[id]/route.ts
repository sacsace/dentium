import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { resolveFeaturedImageForSave } from "@/lib/post-images";
import { normalizePostStatus, POST_STATUS_ACTIVE } from "@/lib/post-status";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  const existing = await prisma.post.findUnique({ where: { id } });
  const status = normalizePostStatus(data.status);

  const post = await prisma.post.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      featuredImage: resolveFeaturedImageForSave(data),
      type: data.type,
      status,
      isFeatured: data.isFeatured,
      isPopular: data.isPopular,
      tags: data.tags,
      authorName: data.authorName,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      publishedAt:
        status === POST_STATUS_ACTIVE && !existing?.publishedAt ? new Date() : existing?.publishedAt,
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
