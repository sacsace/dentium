import { staticPageMetadata } from "@/lib/seo";
import { RemoteImage } from "@/components/ui/RemoteImage";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { resolvePostFeaturedImage } from "@/lib/post-images";

export const metadata = staticPageMetadata("blog");

interface Props {
  searchParams: Promise<{ type?: string; tag?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const where: Record<string, unknown> = { status: "PUBLISHED" };

  if (params.type === "news") where.type = "NEWS";
  if (params.type === "blog") where.type = "BLOG";
  if (params.tag) where.tags = { has: params.tag };

  let posts: Awaited<ReturnType<typeof prisma.post.findMany>> = [];

  try {
    posts = await prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    // DB not connected
  }

  return (
    <>
      <PageHeader
        title="Blog & Newsroom"
        subtitle="Dentium Newsroom"
        description="Stay updated with the latest from Dentium"
      />

      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap gap-2 mb-10">
            {[
              { label: "All", href: "/blog" },
              { label: "News", href: "/blog?type=news" },
              { label: "Blog", href: "/blog?type=blog" },
            ].map((filter) => (
              <Link
                key={filter.href}
                href={filter.href}
                className={`px-4 py-2 text-sm rounded-sm transition-colors ${
                  (filter.href === "/blog" && !params.type) ||
                  (params.type && filter.href.includes(params.type))
                    ? "bg-brand-accent text-brand-navy"
                    : "bg-brand-gray text-brand-dark hover:bg-brand-light"
                }`}
              >
                {filter.label}
              </Link>
            ))}
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, i) => {
                const image = resolvePostFeaturedImage(post);
                return (
                <AnimatedSection key={post.id} delay={i * 0.05}>
                  <Link href={`/blog/${encodeURIComponent(post.slug || post.id)}`} className="group block">
                    <div className="relative aspect-[16/10] rounded-sm overflow-hidden mb-4 bg-brand-gray">
                      {image && (
                        <RemoteImage src={image} alt={post.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      )}
                    </div>
                    <span className="text-brand-deep text-xs tracking-wider uppercase">
                      {post.type === "NEWS" ? "Newsroom" : "Blog"}
                    </span>
                    <h3 className="font-display text-xl font-semibold text-brand-navy mt-2 mb-2 group-hover:text-brand-deep transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-brand-silver text-sm line-clamp-2 mb-2">{post.excerpt}</p>
                    )}
                    {post.publishedAt && (
                      <p className="text-brand-silver text-xs">{formatDate(post.publishedAt)}</p>
                    )}
                  </Link>
                </AnimatedSection>
              );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-brand-silver">No posts found.</div>
          )}
        </div>
      </section>
    </>
  );
}
