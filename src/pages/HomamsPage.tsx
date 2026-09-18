import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/effects/Reveal";
import { HomamCard } from "@/components/cards/HomamCard";
import { ContactCta } from "@/components/sections/ContactCta";
import { getHomams, seedHomams } from "@/lib/data";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/site";

export default function HomamsPage() {
  const [homams, setHomams] = useState<Awaited<ReturnType<typeof getHomams>>>(() =>
    seedHomams.filter((h) => h.active).sort((a, b) => a.order - b.order)
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getHomams()
      .then((data) => {
        if (data && data.length) setHomams(data);
      })
      .finally(() => setLoading(false));
  }, []);


  return (
    <>
      <Helmet>
        <title>18 Vedic Homams — {siteConfig.name}</title>
        <meta
          name="description"
          content="Book authentic Vedic fire rituals (homams) for prosperity, peace, protection, health, and success — performed with proper Vedic procedure."
        />
        <link rel="canonical" href={`${siteConfig.url}/homams`} />
      </Helmet>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Homams", url: "/homams" },
        ])}
      />
      <PageHero
        eyebrow="Sacred Fire Rituals"
        title="18 Vedic Homams"
        subtitle="Book authentic Vedic fire rituals for prosperity, peace, protection, health, and success."
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Homams" }]}
        seed={17}
      />

      <Section>
        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {homams.map((homam, i) => (
              <Reveal key={homam.slug} delay={(i % 3) * 0.05} className="h-full">
                <HomamCard homam={homam} />
              </Reveal>
            ))}
          </div>
        )}
      </Section>

      <ContactCta
        title="Need Help Choosing a Homam?"
        subtitle="Fill the enquiry form and Guruji will recommend the right ritual for your need and an auspicious date."
      />
    </>
  );
}
