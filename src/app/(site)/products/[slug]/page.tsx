import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerPriceContext } from "@/lib/session-price";
import { ShieldCheck } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductPurchaseOptions } from "@/components/products/ProductPurchaseOptions";
import { RequestQuoteButton } from "@/components/products/RequestQuoteButton";
import { ProductLikeButton } from "@/components/products/ProductLikeButton";
import { toClientProduct, getProductPriceLabel } from "@/lib/product-client";
import { getShopBackHref, type ShopFilterParams } from "@/lib/shop-navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, productSchema } from "@/lib/seo-schemas";
import { Check, LogIn, ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ShopFilterParams & { from?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) return buildMetadata({ title: "Product Not Found", path: `/products/${slug}`, noIndex: true });
    return buildMetadata({
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.shortDesc || product.description.slice(0, 160),
      path: `/products/${slug}`,
      image: product.images[0],
    });
  } catch {
    return buildMetadata({ title: "Product", path: `/products/${slug}` });
  }
}

export default async function ProductDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const { priceAccess, isLoggedIn } = await getServerPriceContext();
  const backHref = getShopBackHref(query);

  let product = null;
  let related: Awaited<ReturnType<typeof prisma.product.findMany>> = [];

  try {
    product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true, _count: { select: { likes: true } } },
    });
    if (product) {
      related = await prisma.product.findMany({
        where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
        include: { _count: { select: { likes: true } } },
        take: 4,
      });
    }
  } catch {
    // DB not connected
  }

  if (!product) notFound();

  const specs = product.specifications as Record<string, string> | null;

  const clientProduct = toClientProduct(product);
  const priceLabel = getProductPriceLabel(clientProduct, priceAccess);

  return (
    <>
      <JsonLd
        data={[
          productSchema(product),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: product.name, path: `/products/${product.slug}` },
          ]),
        ]}
      />
      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <Link href={backHref} className="inline-flex items-center gap-2 text-brand-deep text-sm mb-8 hover:gap-3 transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="relative aspect-square bg-brand-light rounded-sm overflow-hidden">
              {product.images[0] && (
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" priority />
              )}
            </div>

            <div>
              {product.brand && (
                <p className="text-brand-silver text-sm uppercase tracking-wider mb-2">{product.brand}</p>
              )}
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-brand-navy mb-4">
                {product.name}
              </h1>
              {product.shortDesc && (
                <p className="text-brand-silver text-lg mb-6">{product.shortDesc}</p>
              )}
              {priceAccess === "full" ? (
                <p className="text-2xl font-semibold text-brand-deep mb-8">{priceLabel}</p>
              ) : priceAccess === "associate" ? (
                <Link
                  href="/account?tab=company"
                  className="inline-flex items-center gap-2 text-2xl font-semibold text-brand-deep mb-8 hover:underline"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Full membership required
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-2xl font-semibold text-brand-deep mb-8 hover:underline"
                >
                  <LogIn className="w-5 h-5" />
                  Login for Price
                </Link>
              )}

              {isLoggedIn && (
              <div className="flex flex-wrap items-start gap-3 mb-8">
                {priceAccess === "full" && <ProductPurchaseOptions product={clientProduct} slug={product.slug} />}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                <RequestQuoteButton productId={product.id} productName={product.name} />
                <div className="flex items-center gap-2">
                  <ProductLikeButton productId={product.id} className="shadow-sm border border-gray-100" iconClassName="w-5 h-5" />
                  {(product as { _count?: { likes: number } })._count?.likes ? (
                    <span className="text-sm text-brand-silver">{(product as { _count: { likes: number } })._count.likes} likes</span>
                  ) : null}
                </div>
                </div>
              </div>
              )}

              {product.features.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold text-brand-navy mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-brand-dark/80">
                        <Check className="w-4 h-4 text-brand-deep shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-brand-gray text-brand-silver text-xs rounded-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl font-semibold text-brand-navy mb-4">Description</h2>
              <div className="prose-content" dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, "<br/>") }} />

              {specs && Object.keys(specs).length > 0 && (
                <div className="mt-10">
                  <h2 className="font-display text-2xl font-semibold text-brand-navy mb-4">Specifications</h2>
                  <div className="bg-brand-gray rounded-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody>
                        {Object.entries(specs).map(([key, value]) => (
                          <tr key={key} className="border-b border-white">
                            <td className="px-4 py-3 font-medium text-brand-navy w-1/3">{key}</td>
                            <td className="px-4 py-3 text-brand-silver">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="bg-brand-gray p-6 rounded-sm">
                <h3 className="font-semibold text-brand-navy mb-2">Category</h3>
                <Link href={`/products?category=${product.category.slug}`} className="text-brand-deep hover:underline text-sm">
                  {product.category.name}
                </Link>
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="font-display text-2xl font-semibold text-brand-navy mb-8">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((p) => (
                  <ProductCard key={p.id} product={toClientProduct(p)} priceAccess={priceAccess} isLoggedIn={isLoggedIn} likeCount={(p as { _count?: { likes: number } })._count?.likes ?? 0} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
