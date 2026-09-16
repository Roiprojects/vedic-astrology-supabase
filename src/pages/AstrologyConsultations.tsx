import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/effects/Reveal";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { ContactCta } from "@/components/sections/ContactCta";
import { getServices } from "@/lib/data";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/site";

export default function AstrologyConsultationsPage() {
  const [services, setServices] = useState<Awaited<ReturnType<typeof getServices>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then(setServices)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Premium Astrology Consultations — {siteConfig.name}</title>
        <meta
          name="description"
          content="10 premium Vedic astrology consultation services for love, marriage, career, finance, family, health, education, business, and legal matters."
        />
        <link rel="canonical" href={`${siteConfig.url}/services/astrology-consultations`} />
      </Helmet>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: "Astrology Consultations", url: "/services/astrology-consultations" },
        ])}
      />
      <PageHero
        eyebrow="Premium Consultations"
        title="Vedic Astrology Consultations"
        subtitle="Personalized, confidential guidance for every important area of your life — rooted in authentic Vedic wisdom."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Services", href: "/services" },
          { name: "Astrology Consultations" },
        ]}
      />

      <Section>
        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal key={service.slug} delay={(i % 3) * 0.05}>
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>
        )}
      </Section>

      <ContactCta
        title="Ready for Clarity?"
        subtitle="Book a consultation or chat with Guruji for personalized Vedic guidance."
      />
    </>
  );
}
