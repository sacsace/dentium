import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import {
  csvToRecords,
  parseCsvBoolean,
  type BulkImportFailure,
  type BulkImportResult,
} from "@/lib/csv-import";

async function uniqueCategorySlug(base: string): Promise<string> {
  let slug = slugify(base, { lower: true, strict: true }) || "category";
  let candidate = slug;
  let index = 2;

  while (await prisma.category.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${slug}-${index}`;
    index++;
  }

  return candidate;
}

export async function importCategoriesFromCsv(csv: string): Promise<BulkImportResult> {
  const records = csvToRecords(csv);
  const failed: BulkImportFailure[] = [];
  let created = 0;

  for (let index = 0; index < records.length; index++) {
    const record = records[index];
    const row = index + 2;
    const name = record.name?.trim();

    if (!name) {
      failed.push({ row, error: "Name is required" });
      continue;
    }

    try {
      const slug = record.slug?.trim() || (await uniqueCategorySlug(name));
      const slugTaken = await prisma.category.findFirst({
        where: {
          slug,
          NOT: { name: { equals: name, mode: "insensitive" } },
        },
        select: { id: true },
      });

      if (slugTaken) {
        failed.push({ row, name, error: `Slug "${slug}" is already used` });
        continue;
      }

      const existing = await prisma.category.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
        select: { id: true },
      });

      if (existing) {
        failed.push({ row, name, error: "Category with this name already exists" });
        continue;
      }

      await prisma.category.create({
        data: {
          name,
          slug,
          description: record.description?.trim() || null,
          image: record.image?.trim() || null,
          sortOrder: record.sortorder ? Number.parseInt(record.sortorder, 10) || 0 : 0,
          isActive: parseCsvBoolean(record.isactive, true),
        },
      });
      created++;
    } catch (error) {
      failed.push({
        row,
        name,
        error: error instanceof Error ? error.message : "Failed to create category",
      });
    }
  }

  return { created, failed };
}

export const CATEGORY_IMPORT_TEMPLATE = `name,description,image,sortOrder,isActive
Categories 1,First category,,0,true
Categories 2,Second category,,1,true`;
