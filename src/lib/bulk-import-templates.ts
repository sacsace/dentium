export const PRODUCT_IMPORT_TEMPLATE = `name,category,sku,description,shortDesc,brand,price,showPrice,isFeatured,isNew,isActive,tags,features,images
Sample Product,Categories 1,SKU-001,Full product description,Short summary,Dentium,499,true,false,true,true,"tag1, tag2",Feature 1|Feature 2,https://example.com/image.jpg`;

export const CATEGORY_IMPORT_TEMPLATE = `name,description,image,sortOrder,isActive
Categories 1,First category,,0,true
Categories 2,Second category,,1,true`;

export const COUPON_IMPORT_TEMPLATE = `code,description,discountType,discountValue,minOrderAmount,maxUses,expiresAt,isActive
,Welcome 10%,PERCENT,10,1000,100,2026-12-31,true
SAVE500,Flat 500 off,FIXED,500,5000,,2026-12-31,true`;

export { ERP_CUSTOMER_IMPORT_TEMPLATE } from "@/lib/erp-customer-samples";
