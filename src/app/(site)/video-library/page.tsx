import { staticPageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { DENTIUM_STUDY_VIDEOS, SITE_VIDEOS } from "@/lib/site-config";
import { FeaturedVideosGrid } from "@/components/video/FeaturedVideosGrid";
import { Play } from "lucide-react";

export const metadata = staticPageMetadata("videoLibrary");

export default function VideoLibraryPage() {
  return (
    <>
      <PageHeader
        title="Video Library"
        subtitle="Resources"
        description="Watch clinical demonstrations, product overviews, and educational content"
      />
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-semibold text-brand-navy mb-2">Featured Videos</h2>
            <p className="text-brand-silver text-sm">Official Dentium brand and clinical showcase videos.</p>
          </div>
          <FeaturedVideosGrid videos={SITE_VIDEOS.heroSlides} />

          <h2 className="font-display text-2xl font-semibold text-brand-navy mb-6">Clinical & Product Library</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DENTIUM_STUDY_VIDEOS.map((title) => (
              <div key={title} className="p-5 bg-brand-gray rounded-sm hover:bg-brand-light transition-colors">
                <div className="w-12 h-12 bg-brand-deep rounded-sm flex items-center justify-center text-white mb-3">
                  <Play className="w-5 h-5 ml-0.5" />
                </div>
                <h3 className="font-medium text-brand-navy text-sm leading-snug">{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
