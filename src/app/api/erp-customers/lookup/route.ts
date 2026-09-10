import { NextRequest, NextResponse } from "next/server";
import { lookupErpCustomerByPhone } from "@/lib/bulk-erp-customer-import";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`erp-lookup:${ip}`, 30, 15 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfter);

  const phone = req.nextUrl.searchParams.get("phone") || "";
  if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ matched: false });
  }

  const record = await lookupErpCustomerByPhone(phone);
  if (!record) {
    return NextResponse.json({ matched: false });
  }

  // Minimal fields only — avoid leaking full ERP directory via enumeration
  return NextResponse.json({
    matched: true,
    erpCustomerNumber: record.erpCustomerNumber,
    customerName: record.customerName,
    company: record.company,
  });
}
