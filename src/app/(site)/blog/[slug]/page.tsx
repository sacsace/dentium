import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RemoteImage } from "@/components/ui/RemoteImage";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { resolvePostFeaturedImage } from "@/lib/post-images";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { articleSchema, breadcrumbSchema } from "@/lib/seo-schemas";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  try {
    const post =
      (await prisma.post.findUnique({ where: { slug } })) ||
      (await prisma.post.findUnique({ where: { id: slug } }));
    if (!post) return buildMetadata({ title: "Post Not Found", path: `/blog/${slug}`, noIndex: true });
    return buildMetadata({
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || undefined,
      path: `/blog/${post.slug || post.id}`,
      image: resolvePostFeaturedImage(post),
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.authorName ? [post.authorName] : undefined,
    });
  } catch {
    return buildMetadata({ title: "Blog", path: `/blog/${slug}` });
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  let post = null;
  try {
    post = await prisma.post.findUnique({ where: { slug } });
    if (!post && slug) {
      // Fallback for older broken empty-slug posts that were linked by id
      post = await prisma.post.findUnique({ where: { id: slug } });
    }
    if (post) {
      await prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
    }
  } catch {
    // DB not connected
  }

  if (!post) notFound();

  const featuredImage = resolvePostFeaturedImage(post);

  return (
    <article className="pt-28 pb-20">
      <JsonLd
        data={[
          articleSchema(post),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-brand-deep text-sm mb-8 hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        <span className="text-brand-deep text-xs tracking-wider uppercase">
          {post.type === "NEWS" ? "Newsroom" : "Blog"}
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-brand-navy mt-2 mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-brand-silver text-sm mb-8">
          {post.authorName && <span>By {post.authorName}</span>}
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
        </div>

        {featuredImage && (
          <div className="relative aspect-[16/9] rounded-sm overflow-hidden mb-10">
            <RemoteImage src={featuredImage} alt={post.title} fill className="object-cover" priority />
          </div>
        )}

        <div className="prose-content" dangerouslySetInnerHTML={{ __html: post.content }} />

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className="px-3 py-1 bg-brand-gray text-brand-silver text-xs rounded-sm hover:bg-brand-light transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
