import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema } from "@/lib/seo-schemas";
import { VisitTracker } from "@/components/analytics/VisitTracker";
import { CartAuthSync } from "@/components/cart/CartAuthSync";
import { FavoritesProvider } from "@/components/favorites/FavoritesProvider";
import { SitePopup } from "@/components/site/SitePopup";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <VisitTracker />
      <CartAuthSync />
      <FavoritesProvider>
        <SitePopup />
        <WhatsAppFloat />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </FavoritesProvider>
    </>
  );
}
