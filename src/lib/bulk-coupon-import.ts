import { prisma } from "@/lib/prisma";
import { generateCouponCode, normalizeCouponCode, type DiscountType } from "@/lib/coupon-utils";
import {
  csvToRecords,
  parseCsvBoolean,
  type BulkImportResult,
} from "@/lib/csv-import";

function parseDiscountType(value: string | undefined): DiscountType | null {
  const v = value?.trim().toUpperCase();
  if (v === "PERCENT" || v === "%" || v === "PCT") return "PERCENT";
  if (v === "FIXED" || v === "AMOUNT" || v === "INR") return "FIXED";
  return null;
}

export async function importCouponsFromCsv(csv: string): Promise<BulkImportResult> {
  const records = csvToRecords(csv);
  const failed: BulkImportResult["failed"] = [];
  let created = 0;

  for (let index = 0; index < records.length; index++) {
    const record = records[index];
    const row = index + 2;
    const discountType = parseDiscountType(record.discounttype || record.type);
    const discountValue = Number.parseFloat(record.discountvalue || record.value || "");
    let code = normalizeCouponCode(record.code || "");

    if (!discountType) {
      failed.push({ row, error: "discountType must be PERCENT or FIXED" });
      continue;
    }
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      failed.push({ row, name: code || undefined, error: "discountValue must be greater than 0" });
      continue;
    }
    if (discountType === "PERCENT" && discountValue > 100) {
      failed.push({ row, name: code || undefined, error: "Percent discount cannot exceed 100" });
      continue;
    }

    try {
      if (!code) {
        let unique = false;
        for (let attempt = 0; attempt < 10; attempt++) {
          const candidate = generateCouponCode();
          const exists = await prisma.coupon.findUnique({ where: { code: candidate } });
          if (!exists) {
            code = candidate;
            unique = true;
            break;
          }
        }
        if (!unique) {
          failed.push({ row, error: "Could not generate unique coupon code" });
          continue;
        }
      } else {
        const exists = await prisma.coupon.findUnique({ where: { code } });
        if (exists) {
          failed.push({ row, name: code, error: "Coupon code already exists" });
          continue;
        }
      }

      await prisma.coupon.create({
        data: {
          code,
          description: record.description?.trim() || null,
          discountType,
          discountValue,
          minOrderAmount: record.minorderamount ? Number.parseFloat(record.minorderamount) : null,
          maxUses: record.maxuses ? Number.parseInt(record.maxuses, 10) : null,
          expiresAt: record.expiresat ? new Date(record.expiresat) : null,
          isActive: parseCsvBoolean(record.isactive, true),
        },
      });
      created++;
    } catch (error) {
      failed.push({
        row,
        name: code,
        error: error instanceof Error ? error.message : "Failed to create coupon",
      });
    }
  }

  return { created, failed };
}

export function couponsToCsv(
  coupons: {
    code: string;
    description: string | null;
    discountType: string;
    discountValue: unknown;
    minOrderAmount: unknown;
    maxUses: number | null;
    usedCount: number;
    expiresAt: Date | null;
    isActive: boolean;
  }[]
): string {
  const header = "code,description,discountType,discountValue,minOrderAmount,maxUses,usedCount,expiresAt,isActive";
  const rows = coupons.map((c) =>
    [
      c.code,
      c.description ?? "",
      c.discountType,
      String(c.discountValue),
      c.minOrderAmount != null ? String(c.minOrderAmount) : "",
      c.maxUses ?? "",
      c.usedCount,
      c.expiresAt ? c.expiresAt.toISOString().slice(0, 10) : "",
      c.isActive,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header, ...rows].join("\n");
}

export const COUPON_IMPORT_TEMPLATE = `code,description,discountType,discountValue,minOrderAmount,maxUses,expiresAt,isActive
,Welcome 10%,PERCENT,10,1000,100,2026-12-31,true
SAVE500,Flat 500 off,FIXED,500,5000,,2026-12-31,true`;
