import { Helmet } from "react-helmet-async";
import { PageHero } from "@/components/layout/PageHero";
import { LegalContent } from "@/components/layout/LegalContent";
import { legalLastUpdated, refundPolicy } from "@/lib/data/legal";
import { siteConfig } from "@/lib/site";

export default function RefundCancellationPage() {
  return (
    <>
      <Helmet>
        <title>Refund & Cancellation — {siteConfig.name}</title>
        <meta
          name="description"
          content="Refund and cancellation policy for Vedic Astrology services, consultations, and homam bookings."
        />
        <link rel="canonical" href={`${siteConfig.url}/refund-cancellation`} />
      </Helmet>
      <PageHero
        eyebrow="Legal"
        title="Refund & Cancellation"
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Refund & Cancellation" },
        ]}
        seed={44}
      />
      <LegalContent sections={refundPolicy} lastUpdated={legalLastUpdated} />
    </>
  );
}
