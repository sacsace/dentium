import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export { escapeHtml, sanitizeRichHtml } from "@/lib/html-sanitize";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function assertSameOrigin(req: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV !== "production") return null;

  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return null;

  try {
    const originHost = new URL(origin).host;
    if (originHost !== host) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  return null;
}

export const LOGIN_MAX_FAILURES = 8;
export const LOGIN_LOCK_MS = 15 * 60 * 1000;
