import { staticPageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { ResumeApplicationForm } from "@/components/careers/ResumeApplicationForm";

export const metadata = staticPageMetadata("careers");

export default function CareersPage() {
  return (
    <>
      <PageHeader
        title="Join Our Team"
        subtitle="Careers"
        description="Explore exciting career opportunities with Dentium India."
      />
      <section className="py-16 bg-brand-gray/40">
        <div className="container mx-auto px-4 lg:px-8 w-full">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-10 items-start">
            <div className="xl:col-span-3 space-y-4">
              <p className="text-brand-dark leading-relaxed">
                Dentium is a global leader in dental innovation. We are looking for talented professionals across India to join our teams in Sales, Human Resources, Administration, Marketing, Logistics, and Customer Support.
              </p>
              <p className="text-brand-silver leading-relaxed">
                Grow your career with us and be part of our continued success.
              </p>
            </div>
            <div className="xl:col-span-9 w-full min-w-0">
              <ResumeApplicationForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
