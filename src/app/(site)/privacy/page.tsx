import Link from "next/link";
import { staticPageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { SITE } from "@/lib/site-config";
import { getPrivacyPolicyBlocks, PRIVACY_LAST_UPDATED } from "@/lib/privacy-policy-content";

export const metadata = staticPageMetadata("privacy");

export default function PrivacyPage() {
  const blocks = getPrivacyPolicyBlocks();

  return (
    <>
      <PageHeader
        title="Privacy Policy"
        subtitle="Legal"
        description={`${SITE.legalName} — last updated ${PRIVACY_LAST_UPDATED}`}
      />
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl prose-content">
          {blocks.map((block, index) => {
            if (block.type === "h2") {
              return <h2 key={`${block.type}-${index}`}>{block.text}</h2>;
            }
            if (block.type === "h3") {
              return <h3 key={`${block.type}-${index}`}>{block.text}</h3>;
            }
            if (block.type === "ul") {
              return (
                <ul key={`${block.type}-${index}`}>
                  {block.items.map((item) => (
                    <li key={item.slice(0, 40)}>{renderContactLinks(item)}</li>
                  ))}
                </ul>
              );
            }
            return <p key={`${block.type}-${index}`}>{renderContactLinks(block.text)}</p>;
          })}
        </div>
      </section>
    </>
  );
}

function renderContactLinks(text: string) {
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const urlMatch = text.match(/(https?:\/\/[^\s]+)/);

  if (emailMatch && text.includes("email:")) {
    const email = emailMatch[1];
    return (
      <>
        By sending us an email:{" "}
        <Link href={`mailto:${email}`} className="text-brand-deep hover:underline">
          {email}
        </Link>
      </>
    );
  }

  if (urlMatch && text.includes("website:")) {
    const url = urlMatch[1];
    return (
      <>
        By visiting this page on our website:{" "}
        <Link href="/contact" className="text-brand-deep hover:underline break-all">
          {url}
        </Link>
      </>
    );
  }

  return text;
}
