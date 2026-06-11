import { NextResponse } from "next/server";
import { trackPageVisit } from "@/lib/analytics";

const SKIP_PREFIXES = ["/admin", "/api", "/auth", "/_next"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const path = typeof body.path === "string" ? body.path : "";
    const visitorKey = typeof body.visitorKey === "string" ? body.visitorKey : "";
    const referrer = typeof body.referrer === "string" ? body.referrer : undefined;

    if (!path || !visitorKey) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    if (SKIP_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const userAgent = req.headers.get("user-agent") || undefined;

    await trackPageVisit({ path, referrer, visitorKey, userAgent });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
