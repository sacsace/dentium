import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchResults } from "@/components/search/SearchResults";

export const metadata = buildMetadata({
  title: "Search",
  description: "Search Dentium products, blog posts, news, events, videos, and pages.",
  path: "/search",
});

export default function SearchPage() {
  return (
    <>
      <PageHeader
        title="Search"
        subtitle="Find anything"
        description="Search across products, blog, news, events, education videos, and site pages."
      />
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <Suspense fallback={<p className="text-brand-silver text-sm">Loading search...</p>}>
            <SearchResults />
          </Suspense>
        </div>
      </section>
    </>
  );
}
