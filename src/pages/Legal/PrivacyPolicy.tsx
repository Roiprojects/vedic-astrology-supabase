import { Helmet } from "react-helmet-async";
import { PageHero } from "@/components/layout/PageHero";
import { LegalContent } from "@/components/layout/LegalContent";
import { legalLastUpdated, privacyPolicy } from "@/lib/data/legal";
import { siteConfig } from "@/lib/site";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — {siteConfig.name}</title>
        <meta
          name="description"
          content="How Vedic Astrology collects, uses, and protects your personal information and birth details."
        />
        <link rel="canonical" href={`${siteConfig.url}/privacy-policy`} />
      </Helmet>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Privacy Policy" }]}
        seed={41}
      />
      <LegalContent sections={privacyPolicy} lastUpdated={legalLastUpdated} />
    </>
  );
}
