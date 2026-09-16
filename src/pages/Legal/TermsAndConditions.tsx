import { Helmet } from "react-helmet-async";
import { PageHero } from "@/components/layout/PageHero";
import { LegalContent } from "@/components/layout/LegalContent";
import { legalLastUpdated, termsAndConditions } from "@/lib/data/legal";
import { siteConfig } from "@/lib/site";

export default function TermsAndConditionsPage() {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions — {siteConfig.name}</title>
        <meta
          name="description"
          content="The terms and conditions governing the use of Vedic Astrology services, bookings, and payments."
        />
        <link rel="canonical" href={`${siteConfig.url}/terms-and-conditions`} />
      </Helmet>
      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Terms & Conditions" }]}
        seed={43}
      />
      <LegalContent sections={termsAndConditions} lastUpdated={legalLastUpdated} />
    </>
  );
}
