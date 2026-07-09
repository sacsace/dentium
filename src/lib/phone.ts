/** Normalize phone for ERP matching (India-focused: last 10 digits). */
export function normalizePhoneForLookup(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return digits.slice(-10);
}

export function phonesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const na = normalizePhoneForLookup(a);
  const nb = normalizePhoneForLookup(b);
  return Boolean(na && nb && na === nb);
}
