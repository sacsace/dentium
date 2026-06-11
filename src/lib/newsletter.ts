const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeNewsletterEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!email || !EMAIL_PATTERN.test(email)) return null;
  return email;
}

export function normalizeNewsletterSource(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const source = value.trim().toLowerCase();
  if (!source || source.length > 32) return null;
  return source;
}
