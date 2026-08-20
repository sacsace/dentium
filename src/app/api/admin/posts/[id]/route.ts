import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { resolveFeaturedImageForSave } from "@/lib/post-images";
import { normalizePostStatus, POST_STATUS_ACTIVE } from "@/lib/post-status";
import { notifySubscribersOnBlogPublish } from "@/lib/blog-notify";
import { ensureUniqueSlug } from "@/lib/slug";

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
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const status = normalizePostStatus(data.status);
  const requestedSlug = typeof data.slug === "string" ? data.slug.trim() : "";
  const slug = await ensureUniqueSlug(
    requestedSlug || data.title || existing.title || existing.slug,
    async (candidate) => {
      const found = await prisma.post.findUnique({ where: { slug: candidate }, select: { id: true } });
      return Boolean(found && found.id !== id);
    },
    `post-${id.slice(0, 8)}`,
  );

  const post = await prisma.post.update({
    where: { id },
    data: {
      title: data.title,
      slug,
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
        status === POST_STATUS_ACTIVE && !existing.publishedAt ? new Date() : existing.publishedAt,
    },
  });

  const newlyPublished =
    status === POST_STATUS_ACTIVE && existing?.status !== POST_STATUS_ACTIVE;
  if (newlyPublished) {
    notifySubscribersOnBlogPublish(post).catch(() => {});
  }

  return NextResponse.json(post);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
