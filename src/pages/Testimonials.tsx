import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { TestimonialsGrid } from "@/components/testimonials/TestimonialsGrid";
import { ContactCta } from "@/components/sections/ContactCta";
import { getTestimonials } from "@/lib/data";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/site";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Awaited<ReturnType<typeof getTestimonials>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTestimonials()
      .then(setTestimonials)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Client Testimonials — {siteConfig.name}</title>
        <meta
          name="description"
          content="Real experiences from people who received Vedic astrology guidance, homams, and spiritual remedies from Guruji."
        />
        <link rel="canonical" href={`${siteConfig.url}/testimonials`} />
      </Helmet>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Testimonials", url: "/testimonials" },
        ])}
      />
      <PageHero
        eyebrow="Testimonials"
        title="Client Testimonials"
        subtitle="Real experiences from people who received astrology guidance and spiritual remedies."
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Testimonials" }]}
        seed={27}
      />

      <Section>
        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : (
          <TestimonialsGrid items={testimonials} />
        )}
      </Section>

      <ContactCta
        title="Need Guidance Like Them?"
        subtitle="Book a consultation or chat with Guruji for your own spiritual guidance."
      />
    </>
  );
}
