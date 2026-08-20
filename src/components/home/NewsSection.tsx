"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { formatDate } from "@/lib/utils";
import { resolvePostFeaturedImage } from "@/lib/post-images";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  featuredImage?: string | null;
  type: string;
  publishedAt?: Date | null;
}

export function NewsSection({ posts }: { posts: Post[] }) {
  const featured = posts[0];
  const rest = posts.slice(1, 5);
  const featuredImage = featured ? resolvePostFeaturedImage(featured) : null;

  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="section-eyebrow">Clinical Cases</p>
            <h2 className="section-title">Blogs</h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-brand-navy font-semibold text-sm border-b border-brand-navy/20 pb-0.5 hover:border-brand-accent hover:text-brand-deep transition-colors"
          >
            View more <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {featured && (
            <AnimatedSection>
              <Link href={`/blog/${encodeURIComponent(featured.slug || featured.id)}`} className="group block">
                <div className="relative aspect-[16/10] rounded-sm overflow-hidden mb-4 bg-brand-gray">
                  {featuredImage && (
                    <RemoteImage
                      src={featuredImage}
                      alt={featured.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <span className="text-brand-deep text-xs tracking-wider uppercase">
                  {featured.type === "NEWS" ? "Newsroom" : "Blog"}
                </span>
                <h3 className="font-display text-2xl font-semibold text-brand-navy mt-2 mb-2 group-hover:text-brand-deep transition-colors">
                  {featured.title}
                </h3>
                {featured.excerpt && (
                  <p className="text-brand-silver text-sm line-clamp-2">{featured.excerpt}</p>
                )}
                {featured.publishedAt && (
                  <p className="text-brand-silver text-xs mt-3">{formatDate(featured.publishedAt)}</p>
                )}
              </Link>
            </AnimatedSection>
          )}

          <div className="space-y-4">
            {rest.map((post, i) => {
              const image = resolvePostFeaturedImage(post);
              return (
                <AnimatedSection key={post.id} delay={i * 0.1}>
                  <Link
                    href={`/blog/${encodeURIComponent(post.slug || post.id)}`}
                    className="group flex gap-4 p-4 rounded-sm hover:bg-brand-gray transition-colors"
                  >
                    {image && (
                      <div className="relative w-24 h-24 shrink-0 rounded-sm overflow-hidden">
                        <RemoteImage src={image} alt={post.title} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-brand-deep text-xs tracking-wider uppercase">
                        {post.type === "NEWS" ? "Newsroom" : "Blog"}
                      </span>
                      <h4 className="font-medium text-brand-navy mt-1 group-hover:text-brand-deep transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      {post.publishedAt && (
                        <p className="text-brand-silver text-xs mt-1">{formatDate(post.publishedAt)}</p>
                      )}
                    </div>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
