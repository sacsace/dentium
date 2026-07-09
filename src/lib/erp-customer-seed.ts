import { prisma } from "@/lib/prisma";
import { normalizePhoneForLookup } from "@/lib/phone";
import { ERP_CUSTOMER_SAMPLE_ROWS } from "@/lib/erp-customer-samples";

export async function ensureErpCustomerSamples() {
  const count = await prisma.erpCustomerRecord.count();
  if (count > 0) return { seeded: false, count };

  const importBatch = await prisma.erpCustomerImport.create({
    data: {
      fileName: "default-sample-list.csv",
      rowCount: ERP_CUSTOMER_SAMPLE_ROWS.length,
      createdCount: ERP_CUSTOMER_SAMPLE_ROWS.length,
    },
  });

  for (const row of ERP_CUSTOMER_SAMPLE_ROWS) {
    const phoneNormalized = normalizePhoneForLookup(row.phone);
    if (!phoneNormalized) continue;

    await prisma.erpCustomerRecord.create({
      data: {
        erpCustomerNumber: row.erpCustomerNumber,
        phoneNormalized,
        phoneRaw: row.phone,
        customerName: row.customerName,
        company: row.customerName,
        email: row.email,
        gstNo: row.gstNo,
        panNo: row.panNo,
        state: row.state,
        address: row.address,
        others: row.others,
        erpStatus: row.erpStatus,
        importId: importBatch.id,
      },
    });
  }

  return { seeded: true, count: ERP_CUSTOMER_SAMPLE_ROWS.length };
}
