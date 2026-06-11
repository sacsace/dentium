import { staticPageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { DownloadList } from "@/components/downloads/DownloadList";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatFileSize } from "@/lib/format-file-size";

export const metadata = staticPageMetadata("downloads");

export default async function DownloadsPage() {
  const session = await getSession();

  let items: Awaited<ReturnType<typeof prisma.downloadResource.findMany>> = [];

  try {
    items = await prisma.downloadResource.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    // DB not connected
  }

  const listItems = items.map((item) => ({
    id: item.id,
    title: item.title,
    fileType: item.fileType,
    fileSizeLabel: formatFileSize(item.fileSizeBytes),
    requiresLogin: item.requiresLogin,
  }));

  return (
    <>
      <PageHeader
        title="Downloads"
        subtitle="Resources"
        description="Product brochures, surgical guides, and technical documentation"
      />
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <DownloadList items={listItems} isLoggedIn={!!session} />
        </div>
      </section>
    </>
  );
}
