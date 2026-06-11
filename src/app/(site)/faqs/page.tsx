import { staticPageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/seo-schemas";

export const metadata = staticPageMetadata("faqs");

const faqs = [
  { q: "How do I create a Dentium account?", a: "Click Sign Up and complete the registration form with your professional details including GSTIN, DCI number, and clinic address. A verified account is required to view product pricing." },
  { q: "Why do I need to login to see prices?", a: "Dentium operates as a B2B platform in India for dental professionals. Product pricing is available only to registered and verified accounts." },
  { q: "What implant systems does Dentium offer?", a: "We offer the Bright and SuperLine implant systems, including fixtures, abutments, surgical kits, and prosthetic components." },
  { q: "How can I track my order?", a: "Visit Order Tracking or My Order in your account dashboard after logging in." },
  { q: "How do I contact customer care?", a: "Call +91 9625994598 or email info.india@dentium.com. Our office is at The Palm Spring Plaza, Sector 54, Gurugram." },
  { q: "Are Dentium products genuine?", a: "Yes. Implantium India Private Limited is the official Dentium partner in India. All products are 100% genuine with full manufacturer support." },
];

export default function FAQsPage() {
  return (
    <>
      <JsonLd data={faqSchema(faqs.map((faq) => ({ question: faq.q, answer: faq.a })))} />
      <PageHeader title="FAQs" subtitle="Support" description="Common questions about products, accounts, and orders" />
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl space-y-6">
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-brand-gray p-6 rounded-sm">
              <h3 className="font-semibold text-brand-navy mb-2">{faq.q}</h3>
              <p className="text-brand-silver text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
