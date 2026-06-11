import { staticPageMetadata } from "@/lib/seo";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = staticPageMetadata("gallery");

const images = [
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600",
  "https://images.unsplash.com/photo-1515187028565-6efe4c0a0edc?w=600",
  "https://images.unsplash.com/photo-1505373877841-8d25f39d4666?w=600",
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600",
  "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600",
];

export default function GalleryPage() {
  return (
    <>
      <PageHeader title="Gallery" subtitle="Events & Seminars" description="Photos from Dentium seminars, Smile SAGA, and clinical education events" />
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((src, i) => (
              <div key={i} className="relative aspect-[4/3] rounded-sm overflow-hidden">
                <Image src={src} alt={`Dentium event ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
