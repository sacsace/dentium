import { staticPageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { prisma } from "@/lib/prisma";
import { DENTIUM_STUDY_VIDEOS } from "@/lib/site-config";
import { Play } from "lucide-react";

export const metadata = staticPageMetadata("dentiumStudy");

export default async function DentiumStudyPage() {
  let videos: { id: string; title: string; slug: string }[] = [];

  try {
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED", tags: { has: "dentium-study" } },
      orderBy: { title: "asc" },
    });
    videos = posts.map((p) => ({ id: p.id, title: p.title, slug: p.slug }));
  } catch {
    // fallback
  }

  const items = videos.length > 0
    ? videos
    : DENTIUM_STUDY_VIDEOS.map((title, i) => ({
        id: String(i),
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      }));

  return (
    <>
      <PageHeader title="Dentium Study" subtitle="Clinical Education" description="Video library for implant procedures, surgical techniques, and product workflows" />
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} id={item.slug} className="flex items-start gap-4 p-4 bg-brand-gray rounded-sm hover:bg-brand-light transition-colors scroll-mt-32">
                <div className="shrink-0 w-10 h-10 bg-brand-deep rounded-sm flex items-center justify-center text-white">
                  <Play className="w-4 h-4 ml-0.5" />
                </div>
                <div>
                  <h3 className="font-medium text-brand-navy">{item.title}</h3>
                  <p className="text-brand-silver text-sm mt-1">Clinical education resource</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
