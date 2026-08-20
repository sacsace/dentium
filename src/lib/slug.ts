import slugify from "slugify";

/**
 * Build a URL-safe slug. ASCII titles use slugify; non-Latin titles (e.g. Korean)
 * keep Unicode letters so links are not empty.
 */
export function toSlug(input: string, fallbackPrefix = "item"): string {
  const raw = (input || "").trim();
  if (!raw) return `${fallbackPrefix}-${Date.now().toString(36)}`;

  const ascii = slugify(raw, { lower: true, strict: true });
  if (ascii) return ascii;

  const unicode = raw
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (unicode) return unicode;
  return `${fallbackPrefix}-${Date.now().toString(36)}`;
}

export async function ensureUniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
  fallbackPrefix = "item",
): Promise<string> {
  const root = toSlug(base, fallbackPrefix);
  let candidate = root;
  let n = 2;
  while (await exists(candidate)) {
    candidate = `${root}-${n}`;
    n += 1;
  }
  return candidate;
}
