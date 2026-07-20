import Link from "next/link";
import { BriefcaseBusiness, CheckCircle2, Clock3, FileUp, MapPin } from "lucide-react";
import { staticPageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { ResumeApplicationForm } from "@/components/careers/ResumeApplicationForm";
import { prisma } from "@/lib/prisma";
import { EMPLOYMENT_TYPE_LABELS, splitJobLines } from "@/lib/jobs";
import { getJobCategoryLabel } from "@/lib/resume";

export const metadata = staticPageMetadata("careers");

export const revalidate = 300;

export default async function CareersPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string; tab?: string }>;
}) {
  const { job: selectedSlug, tab } = await searchParams;
  const jobs = await prisma.jobPosting.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
  });
  const selectedJob = jobs.find((job) => job.slug === selectedSlug);
  const activeTab = tab === "apply" || selectedJob ? "apply" : "jobs";

  return (
    <>
      <PageHeader
        title="Join Our Team"
        subtitle="Careers"
        description="Explore exciting career opportunities with Dentium India."
      />

      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex gap-2 pt-7" aria-label="Careers sections">
            <Link
              href="/careers?tab=jobs"
              className={`inline-flex items-center justify-center gap-2 px-5 md:px-7 py-3.5 border-b-2 text-sm font-semibold transition-colors ${
                activeTab === "jobs"
                  ? "border-brand-accent text-brand-navy"
                  : "border-transparent text-brand-silver hover:text-brand-navy"
              }`}
            >
              <BriefcaseBusiness className="w-4 h-4" />
              Job Postings
            </Link>
            <Link
              href="/careers?tab=apply#apply"
              className={`inline-flex items-center justify-center gap-2 px-5 md:px-7 py-3.5 border-b-2 text-sm font-semibold transition-colors ${
                activeTab === "apply"
                  ? "border-brand-accent text-brand-navy"
                  : "border-transparent text-brand-silver hover:text-brand-navy"
              }`}
            >
              <FileUp className="w-4 h-4" />
              Submit Resume
            </Link>
          </nav>
        </div>
      </div>

      {activeTab === "jobs" && (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mb-10">
            <p className="text-xs tracking-[0.22em] uppercase text-brand-accent font-semibold">Open Positions</p>
            <h2 className="font-display text-3xl md:text-4xl text-brand-navy mt-3">Find your next opportunity</h2>
            <p className="text-brand-silver mt-4 leading-relaxed">
              Join a team advancing dental care across India. Select an opening below to apply with your PDF or Word resume.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {jobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              return (
                <article
                  key={job.id}
                  className={`group border rounded-sm p-6 md:p-7 transition-all ${
                    isSelected
                      ? "border-brand-accent bg-brand-accent/5 shadow-md"
                      : "border-gray-200 hover:border-brand-deep/40 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-brand-accent font-semibold">
                        {getJobCategoryLabel(job.department)}
                      </p>
                      <h3 className="font-display text-xl md:text-2xl text-brand-navy mt-2">{job.title}</h3>
                    </div>
                    <BriefcaseBusiness className="w-6 h-6 text-brand-deep/50 shrink-0" />
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-brand-silver mt-4">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> {job.location || "India"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock3 className="w-4 h-4" /> {EMPLOYMENT_TYPE_LABELS[job.employmentType]}
                    </span>
                  </div>
                  <p className="text-brand-dark/75 mt-5 leading-relaxed">{job.summary || job.description}</p>
                  {job.requirements && (
                    <ul className="mt-5 space-y-2">
                      {splitJobLines(job.requirements).slice(0, 4).map((requirement) => (
                        <li key={requirement} className="flex gap-2 text-sm text-brand-dark/75">
                          <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href={`/careers?tab=apply&job=${encodeURIComponent(job.slug)}#apply`}
                    className="inline-flex items-center justify-center mt-6 px-5 py-2.5 bg-brand-navy text-white text-sm font-medium rounded-sm hover:bg-brand-deep transition-colors"
                  >
                    Apply for This Position
                  </Link>
                </article>
              );
            })}
          </div>
          {jobs.length === 0 && (
            <div className="border border-gray-200 rounded-sm p-10 text-center text-brand-silver">
              There are no published openings at the moment. You can still send a general application below.
            </div>
          )}
        </div>
      </section>
      )}

      {activeTab === "apply" && (
      <section id="apply" className="py-16 bg-brand-gray/40 scroll-mt-24">
        <div className="container mx-auto px-4 lg:px-8 w-full">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-10 items-start">
            <div className="xl:col-span-3 space-y-4">
              {selectedJob && (
                <div className="border border-brand-accent/30 bg-white rounded-sm p-4">
                  <p className="text-xs uppercase tracking-wider text-brand-accent font-semibold">Applying for</p>
                  <p className="font-semibold text-brand-navy mt-1">{selectedJob.title}</p>
                  <p className="text-sm text-brand-silver mt-1">
                    {getJobCategoryLabel(selectedJob.department)}
                  </p>
                </div>
              )}
              <p className="text-brand-dark leading-relaxed">
                Dentium is a global leader in dental innovation. We are looking for talented professionals across India to join our teams in Sales, Human Resources, Administration, Marketing, Logistics, and Customer Support.
              </p>
              <p className="text-brand-silver leading-relaxed">
                Grow your career with us and be part of our continued success.
              </p>
            </div>
            <div className="xl:col-span-9 w-full min-w-0">
              <ResumeApplicationForm
                jobId={selectedJob?.id}
                jobTitle={selectedJob?.title}
                jobDepartment={selectedJob?.department}
              />
            </div>
          </div>
        </div>
      </section>
      )}
    </>
  );
}
