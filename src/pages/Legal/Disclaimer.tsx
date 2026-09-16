import { Helmet } from "react-helmet-async";
import { PageHero } from "@/components/layout/PageHero";
import { LegalContent } from "@/components/layout/LegalContent";
import { disclaimerContent, legalLastUpdated } from "@/lib/data/legal";
import { siteConfig } from "@/lib/site";

export default function DisclaimerPage() {
  return (
    <>
      <Helmet>
        <title>Disclaimer — {siteConfig.name}</title>
        <meta
          name="description"
          content="Astrology provides spiritual guidance and indicative insights. Results are not guaranteed — please consult qualified professionals for medical, legal, or financial decisions."
        />
        <link rel="canonical" href={`${siteConfig.url}/disclaimer`} />
      </Helmet>
      <PageHero
        eyebrow="Legal"
        title="Disclaimer"
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Disclaimer" }]}
        seed={45}
      />
      <LegalContent sections={disclaimerContent} lastUpdated={legalLastUpdated} />
    </>
  );
}
