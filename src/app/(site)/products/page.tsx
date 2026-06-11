import { staticPageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductCard } from "@/components/products/ProductCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export const metadata = staticPageMetadata("products");

interface Props {
  searchParams: Promise<{ category?: string; search?: string; brand?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const session = await getSession();
  const where: Record<string, unknown> = { isActive: true };

  if (params.category) {
    const cat = await prisma.category.findUnique({
      where: { slug: params.category },
      include: { children: { include: { children: true } } },
    }).catch(() => null);
    if (cat) {
      const ids = [
        cat.id,
        ...cat.children.flatMap((c) => [c.id, ...c.children.map((ch) => ch.id)]),
      ];
      where.categoryId = { in: ids };
    } else {
      where.category = { slug: params.category };
    }
  }
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
      { tags: { has: params.search } },
    ];
  }
  if (params.brand) {
    where.brand = params.brand;
  }

  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];

  try {
    [products, categories] = await Promise.all([
      prisma.product.findMany({ where, include: { category: true }, orderBy: { sortOrder: "asc" } }),
      prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    ]);
  } catch {
    // DB not connected
  }

  return (
    <>
      <PageHeader
        title="Dentium Categories"
        subtitle="Products"
        description="Bright and SuperLine implant systems — login for pricing"
      />

      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap gap-2 mb-10">
            <Link
              href="/products"
              className={`px-4 py-2 text-sm rounded-sm transition-colors ${
                !params.category ? "bg-brand-accent text-brand-navy" : "bg-brand-gray text-brand-dark hover:bg-brand-light"
              }`}
            >
              All
            </Link>
            {categories
              .filter((cat) => !cat.parentId || ["bright", "superline"].includes(cat.slug))
              .map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={`px-4 py-2 text-sm rounded-sm transition-colors ${
                  params.category === cat.slug ? "bg-brand-accent text-brand-navy" : "bg-brand-gray text-brand-dark hover:bg-brand-light"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <AnimatedSection key={product.id} delay={i * 0.05}>
                  <ProductCard product={product} isLoggedIn={!!session} />
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-brand-silver text-lg">No products found.</p>
              <p className="text-brand-silver text-sm mt-2">Please ensure the database is connected and seeded.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
