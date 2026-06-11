import { staticPageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductCard } from "@/components/products/ProductCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { toClientProduct } from "@/lib/product-client";
import { ShopFilters } from "@/components/shop/ShopFilters";

export const metadata = staticPageMetadata("shop");

interface Props {
  searchParams: Promise<{
    category?: string;
    search?: string;
    brand?: string;
    tag?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const session = await getSession();
  const where: Record<string, unknown> = { isActive: true };

  if (params.category) where.category = { slug: params.category };
  if (params.brand) where.brand = params.brand;
  if (params.tag) where.tags = { has: params.tag };
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) (where.price as Record<string, number>).gte = parseFloat(params.minPrice);
    if (params.maxPrice) (where.price as Record<string, number>).lte = parseFloat(params.maxPrice);
  }

  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let brands: string[] = [];

  try {
    [products, categories] = await Promise.all([
      prisma.product.findMany({ where, include: { category: true }, orderBy: { name: "asc" } }),
      prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    ]);
    const allProducts = await prisma.product.findMany({ where: { isActive: true }, select: { brand: true } });
    brands = [...new Set(allProducts.map((p) => p.brand).filter(Boolean) as string[])];
  } catch {
    // DB not connected
  }

  return (
    <>
      <PageHeader
        title="Shop"
        subtitle="B2B Store"
        description="Browse our product catalog and request quotes for your practice"
      />

      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <ShopFilters categories={categories} brands={brands} />
            </aside>
            <div className="lg:col-span-3">
              <p className="text-brand-silver text-sm mb-6">{products.length} products found</p>
              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product, i) => (
                    <AnimatedSection key={product.id} delay={i * 0.05}>
                      <ProductCard
                        product={toClientProduct(product)}
                        isLoggedIn={!!session}
                        fromShop
                        shopFilters={params}
                      />
                    </AnimatedSection>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-brand-silver">No products found.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
