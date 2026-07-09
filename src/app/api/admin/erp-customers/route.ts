import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { importErpCustomersFromCsv } from "@/lib/bulk-erp-customer-import";
import { normalizePhoneForLookup } from "@/lib/phone";
import type { Prisma } from "@prisma/client";

function buildSearchWhere(q: string): Prisma.ErpCustomerRecordWhereInput {
  return {
    OR: [
      { customerName: { contains: q, mode: "insensitive" } },
      { erpCustomerNumber: { contains: q, mode: "insensitive" } },
      { gstNo: { contains: q, mode: "insensitive" } },
      { panNo: { contains: q, mode: "insensitive" } },
      { state: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phoneRaw: { contains: q, mode: "insensitive" } },
      { phoneNormalized: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
      { others: { contains: q, mode: "insensitive" } },
      { erpStatus: { contains: q, mode: "insensitive" } },
    ],
  };
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  const where = q ? buildSearchWhere(q) : undefined;

  const [total, filtered, records] = await Promise.all([
    prisma.erpCustomerRecord.count(),
    q ? prisma.erpCustomerRecord.count({ where }) : prisma.erpCustomerRecord.count(),
    prisma.erpCustomerRecord.findMany({
      where,
      orderBy: { customerName: "asc" },
      select: {
        id: true,
        erpCustomerNumber: true,
        phoneRaw: true,
        phoneNormalized: true,
        customerName: true,
        company: true,
        email: true,
        gstNo: true,
        panNo: true,
        state: true,
        address: true,
        others: true,
        erpStatus: true,
        updatedAt: true,
      },
    }),
  ]);

  const phones = [...new Set(records.map((r) => r.phoneNormalized))];
  const linkedUsers =
    phones.length > 0
      ? await prisma.user.findMany({
          where: { phone: { not: null } },
          select: { phone: true, name: true, email: true, isActive: true, membershipTier: true },
        })
      : [];

  const linkedByPhone = new Map<string, (typeof linkedUsers)[number]>();
  for (const user of linkedUsers) {
    if (!user.phone) continue;
    const normalized = normalizePhoneForLookup(user.phone);
    if (normalized) linkedByPhone.set(normalized, user);
  }

  const recordsWithLink = records.map((record) => {
    const linked = linkedByPhone.get(record.phoneNormalized);
    return {
      ...record,
      linkedUser: linked
        ? {
            name: linked.name,
            email: linked.email,
            isActive: linked.isActive,
            membershipTier: linked.membershipTier,
          }
        : null,
    };
  });

  return NextResponse.json({ total, filtered, records: recordsWithLink });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const csv = typeof body.csv === "string" ? body.csv : "";
  const fileName = typeof body.fileName === "string" ? body.fileName : undefined;

  if (!csv.trim()) {
    return NextResponse.json({ error: "CSV content is required" }, { status: 400 });
  }

  const result = await importErpCustomersFromCsv(csv, { fileName });
  return NextResponse.json(result);
}

export async function DELETE() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await prisma.erpCustomerRecord.deleteMany();
  return NextResponse.json({ success: true, deleted: result.count });
}
