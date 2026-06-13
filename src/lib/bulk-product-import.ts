import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import {
  csvToRecords,
  parseCsvBoolean,
  splitCsvList,
  type BulkImportResult,
} from "@/lib/csv-import";

async function uniqueProductSlug(base: string): Promise<string> {
  let slug = slugify(base, { lower: true, strict: true }) || "product";
  let candidate = slug;
  let index = 2;

  while (await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${slug}-${index}`;
    index++;
  }

  return candidate;
}

async function resolveCategoryId(categoryRef: string): Promise<string | null> {
  const trimmed = categoryRef.trim();
  if (!trimmed) return null;

  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { name: { equals: trimmed, mode: "insensitive" } },
        { slug: { equals: trimmed, mode: "insensitive" } },
      ],
    },
    select: { id: true },
  });

  return category?.id ?? null;
}

export async function importProductsFromCsv(csv: string): Promise<BulkImportResult> {
  const records = csvToRecords(csv);
  const failed: BulkImportResult["failed"] = [];
  let created = 0;

  for (let index = 0; index < records.length; index++) {
    const record = records[index];
    const row = index + 2;
    const name = record.name?.trim();
    const categoryRef = record.category?.trim();

    if (!name) {
      failed.push({ row, error: "Name is required" });
      continue;
    }

    if (!categoryRef) {
      failed.push({ row, name, error: "Category is required" });
      continue;
    }

    try {
      const categoryId = await resolveCategoryId(categoryRef);
      if (!categoryId) {
        failed.push({ row, name, error: `Category "${categoryRef}" not found` });
        continue;
      }

      const sku = record.sku?.trim() || null;
      if (sku) {
        const skuTaken = await prisma.product.findUnique({ where: { sku }, select: { id: true } });
        if (skuTaken) {
          failed.push({ row, name, error: `SKU "${sku}" is already used` });
          continue;
        }
      }

      const slug = record.slug?.trim() || (await uniqueProductSlug(name));
      const slugTaken = await prisma.product.findFirst({
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

      const priceRaw = record.price?.trim();
      const price = priceRaw ? Number.parseFloat(priceRaw) : null;

      await prisma.product.create({
        data: {
          name,
          slug,
          categoryId,
          sku,
          description: record.description?.trim() || "",
          shortDesc: record.shortdesc?.trim() || null,
          brand: record.brand?.trim() || "Dentium",
          price: price != null && !Number.isNaN(price) ? price : null,
          showPrice: parseCsvBoolean(record.showprice, false),
          isFeatured: parseCsvBoolean(record.isfeatured, false),
          isNew: parseCsvBoolean(record.isnew, false),
          isActive: parseCsvBoolean(record.isactive, true),
          tags: splitCsvList(record.tags, ","),
          features: splitCsvList(record.features, "|"),
          images: splitCsvList(record.images, "|"),
          seoTitle: record.seotitle?.trim() || null,
          seoDescription: record.seodescription?.trim() || null,
        },
      });
      created++;
    } catch (error) {
      failed.push({
        row,
        name,
        error: error instanceof Error ? error.message : "Failed to create product",
      });
    }
  }

  return { created, failed };
}

export const PRODUCT_IMPORT_TEMPLATE = `name,category,sku,description,shortDesc,brand,price,showPrice,isFeatured,isNew,isActive,tags,features,images
Sample Product,Categories 1,SKU-001,Full product description,Short summary,Dentium,499,true,false,true,true,"tag1, tag2",Feature 1|Feature 2,https://example.com/image.jpg`;
