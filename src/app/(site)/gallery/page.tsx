import { staticPageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { prisma } from "@/lib/prisma";

export const metadata = staticPageMetadata("gallery");

export default async function GalleryPage() {
  let items: Awaited<ReturnType<typeof prisma.galleryImage.findMany>> = [];

  try {
    items = await prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    // DB not connected
  }

  const galleryItems = items.map((item) => ({
    id: item.id,
    title: item.title,
    caption: item.caption,
    imageUrl: item.imageUrl,
    category: item.category,
  }));

  return (
    <>
      <PageHeader
        title="Gallery"
        subtitle="Events & Seminars"
        description="Photos from Dentium seminars, Smile SAGA, and clinical education events"
      />
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <GalleryGrid items={galleryItems} />
        </div>
      </section>
    </>
  );
}
