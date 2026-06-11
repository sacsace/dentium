import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema } from "@/lib/seo-schemas";
import { VisitTracker } from "@/components/analytics/VisitTracker";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <VisitTracker />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
