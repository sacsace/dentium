export function extractFirstImageFromHtml(html?: string | null): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

export function resolvePostFeaturedImage(post: {
  featuredImage?: string | null;
  content?: string | null;
}): string | null {
  const featured = post.featuredImage?.trim();
  if (featured) return featured;
  return extractFirstImageFromHtml(post.content);
}

export function resolveFeaturedImageForSave(data: {
  featuredImage?: string | null;
  content?: string | null;
}): string | null {
  const featured = data.featuredImage?.trim();
  if (featured) return featured;
  return extractFirstImageFromHtml(data.content);
}
