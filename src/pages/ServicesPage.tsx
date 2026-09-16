import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/effects/Reveal";
import { ContactCta } from "@/components/sections/ContactCta";
import { getServiceCategories } from "@/lib/data";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

const categoryGradients: Record<string, string> = {
  "astrology-consultations": "from-indigo-500/30 to-purple-700/30",
  "homam-bookings": "from-orange-500/30 to-red-600/30",
  "birth-chart-pdf": "from-amber-500/30 to-orange-600/30",
  "chat-with-guruji": "from-purple-600/30 to-fuchsia-600/30",
};

export default function ServicesPage() {
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof getServiceCategories>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServiceCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Astrology Services — {siteConfig.name}</title>
        <meta
          name="description"
          content="Explore premium Vedic astrology consultations, sacred homam bookings, birth chart PDF reports, and live chat with Guruji."
        />
        <link rel="canonical" href={`${siteConfig.url}/services`} />
      </Helmet>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
        ])}
      />
      <PageHero
        eyebrow="Our Services"
        title="Astrology Services"
        subtitle="Get personalized guidance for love, marriage, career, finance, family, health, and life challenges."
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Services" }]}
      />

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {loading ? (
            <p className="text-muted">Loading…</p>
          ) : (
            categories.map((cat, i) => (
              <Reveal key={cat.slug} delay={(i % 2) * 0.08} className="h-full">
                <a
                  href={cat.href}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gold/20 bg-surface/60 p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-[var(--shadow-glow-gold)]"
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br opacity-40 blur-3xl transition-opacity group-hover:opacity-70",
                      categoryGradients[cat.slug]
                    )}
                  />
                  <div
                    className={cn(
                      "grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br text-3xl ring-1 ring-gold/25",
                      categoryGradients[cat.slug]
                    )}
                  >
                    {cat.icon}
                  </div>
                  <h2 className="relative mt-6 font-serif text-2xl text-ink">{cat.name}</h2>
                  <p className="relative mt-3 flex-1 leading-relaxed text-muted">
                    {cat.description}
                  </p>
                  <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-medium text-gold-light">
                    Explore
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
              </Reveal>
            ))
          )}
        </div>
      </Section>

      <ContactCta
        title="Not Sure Which Service You Need?"
        subtitle="Message Guruji and get guided to the right consultation or ritual for your situation."
      />
    </>
  );
}
