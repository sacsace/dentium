/**
 * Maps login aliases (root, admin) to the configured admin email.
 * Allows signing in with "root" even when ADMIN_EMAIL is a full email address.
 */
export function resolveLoginIdentifier(identifier: string): string {
  const value = identifier.trim();
  if (!value) return value;

  const alias = value.toLowerCase();
  if (alias === "root" || alias === "admin") {
    return process.env.ADMIN_EMAIL?.trim() || "admin@dentium.in";
  }

  return value;
}
