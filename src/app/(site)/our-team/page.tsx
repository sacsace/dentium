import Link from "next/link";
import { staticPageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { TeamMemberGrid } from "@/components/about/TeamMemberGrid";
import { getActiveTeamMembers } from "@/lib/team-members";

export const metadata = staticPageMetadata("ourTeam");

export default async function OurTeamPage() {
  const members = await getActiveTeamMembers();

  return (
    <>
      <PageHeader
        title="Our Team"
        subtitle="Why Dentium"
        description="Meet the people behind Dentium in India."
      />

      <section className="py-16 lg:py-20 border-t border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          {members.length > 0 ? (
            <TeamMemberGrid members={members} />
          ) : (
            <p className="text-center text-brand-silver text-sm py-12">
              Team profiles will be published here soon.
            </p>
          )}
        </div>
      </section>

      <section className="py-10 border-t border-gray-100 bg-brand-gray/40">
        <div className="container mx-auto px-4 lg:px-8 text-center text-sm text-brand-silver">
          Interested in joining us?{" "}
          <Link href="/careers" className="text-brand-deep font-medium hover:underline">
            View careers
          </Link>
        </div>
      </section>
    </>
  );
}
