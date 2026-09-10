import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self'",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
  "upgrade-insecure-requests",
].join("; ");

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  res.headers.set("Content-Security-Policy", CSP);

  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  // Defense-in-depth: block cross-site POSTs to sensitive APIs without a matching Origin.
  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS") {
    const path = req.nextUrl.pathname;
    if (path.startsWith("/api/auth") || path.startsWith("/api/admin") || path.startsWith("/api/upload")) {
      const origin = req.headers.get("origin");
      const host = req.headers.get("host");
      if (origin && host) {
        try {
          if (new URL(origin).host !== host) {
            return new NextResponse(JSON.stringify({ error: "Invalid request origin" }), {
              status: 403,
              headers: { "Content-Type": "application/json" },
            });
          }
        } catch {
          return new NextResponse(JSON.stringify({ error: "Invalid request origin" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|videos/|logo/).*)"],
};
