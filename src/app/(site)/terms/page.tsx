import { staticPageMetadata, SITE_URL } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { SITE } from "@/lib/site-config";

export const metadata = staticPageMetadata("terms");

const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "");

const TERMS_SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By using ${SITE_DOMAIN}, you agree to comply with and be bound by these terms and conditions, which, together with our Privacy Policy, govern the relationship between you and ${SITE.legalName} in connection with this website. If you do not agree with any part of these terms, you must not use this website.`,
  },
  {
    title: "2. Website Content",
    body: `All content provided on ${SITE_DOMAIN}, including but not limited to product descriptions, images, pricing, and other related information, is for informational purposes only. We strive to ensure accuracy, but we do not guarantee the completeness or reliability of any content on the website. ${SITE.legalName} reserves the right to modify or discontinue any part of the website without prior notice.`,
  },
  {
    title: "3. Product Information",
    body: `${SITE_DOMAIN} offers dental products and equipment for sale. While we make every effort to provide accurate and up-to-date product information, any errors or inaccuracies are unintentional and subject to correction. The availability of products is subject to change without notice.`,
  },
  {
    title: "4. Ordering and Payment",
    body: `By placing an order on ${SITE_DOMAIN}, you agree to pay the specified price for the products and any applicable taxes or shipping fees. Payments can be made using the provided payment methods. We reserve the right to cancel or refuse any order at our discretion.`,
  },
  {
    title: "5. Shipping and Delivery",
    body: `We aim to deliver products in a timely manner, but delivery times may vary based on factors beyond our control. Any estimated delivery times are indicative and not guaranteed. ${SITE.legalName} shall not be liable for any delay or loss caused by shipping carriers or events beyond our reasonable control.`,
  },
  {
    title: "6. User Accounts",
    body: `To access certain features of the website, you may need to create a user account. You are responsible for maintaining the confidentiality of your account information and restricting access to your account. You agree to accept responsibility for all activities that occur under your account.`,
  },
  {
    title: "7. Intellectual Property",
    body: `All content and materials on ${SITE_DOMAIN}, including but not limited to logos, trademarks, product names, images, and text, are the property of ${SITE.legalName} or its licensors and are protected by applicable copyright and intellectual property laws. Any unauthorized use, reproduction, or distribution of such content is strictly prohibited.`,
  },
] as const;

export default function TermsPage() {
  return (
    <>
      <PageHeader title="Terms & Conditions" subtitle="Legal" />
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl prose-content">
          <p>
            Welcome to {SITE_DOMAIN}, the e-commerce website operated by {SITE.legalName}. By accessing or
            using this website, you agree to be bound by the following terms and conditions. Please read them
            carefully before using the website:
          </p>

          {TERMS_SECTIONS.map((section) => (
            <div key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </div>
          ))}

          <h2>Contact</h2>
          <p>
            For questions regarding these terms, contact us at{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or call {SITE.phone}.
          </p>
        </div>
      </section>
    </>
  );
}
