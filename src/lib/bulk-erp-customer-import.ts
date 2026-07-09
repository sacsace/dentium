import { prisma } from "@/lib/prisma";
import { csvToRecords, type BulkImportResult } from "@/lib/csv-import";
import { normalizePhoneForLookup } from "@/lib/phone";
import { deriveErpCustomerNumber } from "@/lib/erp-customer-record";
const ERP_NUMBER_KEYS = [
  "erpcustomernumber",
  "erp_customer_number",
  "erpno",
  "erp_no",
  "customernumber",
  "customer_number",
  "customerid",
  "customer_id",
  "custno",
  "cust_no",
  "code",
];

const PHONE_KEYS = [
  "phone",
  "mobile",
  "mobileno",
  "mobile_no",
  "cell",
  "telephone",
  "tel",
  "contact",
  "phonenumber",
  "phone_number",
  "전화번호",
];

const NAME_KEYS = ["거래처명", "name", "customername", "customer_name", "contactname", "accountname"];
const COMPANY_KEYS = ["company", "clinic", "organization", "organisation"];
const EMAIL_KEYS = ["email", "emailaddress", "email_address", "이메일"];
const GST_KEYS = ["gstno", "gst", "gstin", "gst_no"];
const PAN_KEYS = ["panno", "pan", "pan_no"];
const STATE_KEYS = ["state", "province", "region"];
const ADDRESS_KEYS = ["주소", "address", "addr", "fulladdress"];
const OTHERS_KEYS = ["기타", "others", "other", "misc"];
const STATUS_KEYS = ["status", "erpstatus", "availability"];

function normalizeHeaderKey(key: string) {
  return key.replace(/[\s_.-]/g, "").toLowerCase();
}

function pickField(record: Record<string, string>, keys: string[]): string {
  for (const key of keys) {
    const direct = record[key]?.trim();
    if (direct) return direct;
    const normalizedKey = normalizeHeaderKey(key);
    for (const [recordKey, value] of Object.entries(record)) {
      if (!value?.trim()) continue;
      const rk = normalizeHeaderKey(recordKey);
      if (rk === normalizedKey || rk.includes(normalizedKey) || normalizedKey.includes(rk)) {
        return value.trim();
      }
    }
  }
  for (const key of keys) {
    const candidate = normalizeHeaderKey(key);
    for (const [recordKey, value] of Object.entries(record)) {
      if (!value?.trim()) continue;
      const rk = normalizeHeaderKey(recordKey);
      if (rk.includes(candidate.replace(/_/g, ""))) {
        return value.trim();
      }
    }
  }
  return "";
}

export type ErpDuplicateRow = {
  row: number;
  name?: string;
  erpCustomerNumber: string;
  message: string;
};

export type ErpImportSummary = BulkImportResult & {
  created: number;
  updated: number;
  skipped: number;
  duplicates: ErpDuplicateRow[];
  importId: string;
};

export async function importErpCustomersFromCsv(
  csv: string,
  options?: { fileName?: string }
): Promise<ErpImportSummary> {
  const records = csvToRecords(csv);
  const failed: BulkImportResult["failed"] = [];
  const duplicates: ErpDuplicateRow[] = [];
  let created = 0;
  let updated = 0;
  let skipped = 0;

  const importBatch = await prisma.erpCustomerImport.create({
    data: { fileName: options?.fileName ?? null, rowCount: records.length },
  });

  for (let index = 0; index < records.length; index++) {
    const record = records[index];
    const row = index + 2;
    const customerName = pickField(record, NAME_KEYS) || null;
    const gstNo = pickField(record, GST_KEYS) || null;
    let erpCustomerNumber = pickField(record, ERP_NUMBER_KEYS);
    if (!erpCustomerNumber) {
      erpCustomerNumber = deriveErpCustomerNumber(gstNo || "", customerName || "", index + 1);
    }

    const phoneRaw = pickField(record, PHONE_KEYS);
    const phoneNormalized = normalizePhoneForLookup(phoneRaw);

    if (!phoneNormalized) {
      failed.push({ row, name: customerName || erpCustomerNumber, error: "Valid phone number is required (min 10 digits)" });
      skipped++;
      continue;
    }

    const company = pickField(record, COMPANY_KEYS) || customerName;
    const email = pickField(record, EMAIL_KEYS) || null;
    const panNo = pickField(record, PAN_KEYS) || null;
    const state = pickField(record, STATE_KEYS) || null;
    const address = pickField(record, ADDRESS_KEYS) || null;
    const others = pickField(record, OTHERS_KEYS) || null;
    const erpStatus = pickField(record, STATUS_KEYS) || null;

    const data = {
      erpCustomerNumber,
      phoneNormalized,
      phoneRaw,
      customerName,
      company: company || null,
      email,
      gstNo,
      panNo,
      state,
      address,
      others,
      erpStatus,
      importId: importBatch.id,
    };

    try {
      const existing = await prisma.erpCustomerRecord.findFirst({
        where: { erpCustomerNumber },
      });

      if (existing) {
        await prisma.erpCustomerRecord.update({
          where: { id: existing.id },
          data,
        });
        updated++;
        duplicates.push({
          row,
          name: customerName || undefined,
          erpCustomerNumber,
          message: `Duplicate — existing record updated (${existing.customerName || erpCustomerNumber}).`,
        });
      } else {
        await prisma.erpCustomerRecord.create({ data });
        created++;
      }
    } catch (error) {
      failed.push({
        row,
        name: customerName || erpCustomerNumber,
        error: error instanceof Error ? error.message : "Failed to import row",
      });
      skipped++;
    }
  }

  await prisma.erpCustomerImport.update({
    where: { id: importBatch.id },
    data: { createdCount: created, updatedCount: updated, skippedCount: skipped },
  });

  return {
    created,
    updated,
    skipped,
    failed,
    duplicates,
    importId: importBatch.id,
  };
}

export async function lookupErpCustomerByPhone(phone: string) {
  const phoneNormalized = normalizePhoneForLookup(phone);
  if (!phoneNormalized) return null;

  const record = await prisma.erpCustomerRecord.findFirst({
    where: { phoneNormalized },
    orderBy: { updatedAt: "desc" },
    select: {
      erpCustomerNumber: true,
      customerName: true,
      company: true,
      gstNo: true,
      panNo: true,
      state: true,
      email: true,
      address: true,
    },
  });

  return record;
}
