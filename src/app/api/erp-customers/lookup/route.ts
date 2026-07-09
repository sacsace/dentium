import { NextRequest, NextResponse } from "next/server";
import { lookupErpCustomerByPhone } from "@/lib/bulk-erp-customer-import";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone") || "";
  if (!phone.trim()) {
    return NextResponse.json({ matched: false });
  }

  const record = await lookupErpCustomerByPhone(phone);
  if (!record) {
    return NextResponse.json({ matched: false });
  }

  return NextResponse.json({
    matched: true,
    erpCustomerNumber: record.erpCustomerNumber,
    customerName: record.customerName,
    company: record.company,
  });
}
