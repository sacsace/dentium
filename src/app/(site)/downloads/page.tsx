import { staticPageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Download } from "lucide-react";

export const metadata = staticPageMetadata("downloads");

const downloads = [
  { title: "Bright Implant System Brochure", type: "PDF", size: "2.4 MB" },
  { title: "SuperLine Implant System Catalog", type: "PDF", size: "3.1 MB" },
  { title: "Bright Surgical Protocol Guide", type: "PDF", size: "1.8 MB" },
  { title: "SuperLine Prosthetic Workflow", type: "PDF", size: "2.0 MB" },
  { title: "Dentium Guided Surgery Kit Manual", type: "PDF", size: "4.2 MB" },
  { title: "Product Price List (Login Required)", type: "PDF", size: "—" },
];

export default function DownloadsPage() {
  return (
    <>
      <PageHeader title="Downloads" subtitle="Resources" description="Product brochures, surgical guides, and technical documentation" />
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <div className="space-y-3">
            {downloads.map((item) => (
              <div key={item.title} className="flex items-center justify-between p-4 bg-brand-gray rounded-sm">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-brand-deep" />
                  <div>
                    <p className="font-medium text-brand-navy text-sm">{item.title}</p>
                    <p className="text-brand-silver text-xs">{item.type} · {item.size}</p>
                  </div>
                </div>
                <span className="text-brand-deep text-sm font-medium">Download</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
