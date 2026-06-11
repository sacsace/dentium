import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { testSmtpConnection, formatSmtpError } from "@/lib/mail";

export async function POST() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await testSmtpConnection();
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = formatSmtpError(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
