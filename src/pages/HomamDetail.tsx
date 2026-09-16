import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { IconList } from "@/components/ui/IconList";
import { Reveal } from "@/components/effects/Reveal";
import { StarField } from "@/components/effects/StarField";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactCta } from "@/components/sections/ContactCta";
import { HomamBookingModal } from "@/components/booking/HomamBookingModal";
import { getHomamBySlug } from "@/lib/data";
import { getHomamImage } from "@/lib/presentation/vedic-symbols";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  JsonLd,
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
} from "@/components/seo/JsonLd";

export default function HomamDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [homam, setHomam] = useState<Awaited<ReturnType<typeof getHomamBySlug>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!slug) return;
      const data = await getHomamBySlug(slug);
      if (!cancelled) {
        setHomam(data ?? null);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (!homam) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-gold-gradient">404</h1>
          <p className="mt-4 text-muted">Homam not found.</p>
          <a href="/homams" className="mt-6 inline-block text-gold-light underline">
            Back to homams
          </a>
        </div>
      </div>
    );
  }

  const url = `${siteConfig.url}/homams/${homam.slug}`;

  return (
    <>
      <Helmet>
        <title>{homam.name} — {siteConfig.name}</title>
        <meta name="description" content={homam.shortBenefit} />
        <link rel="canonical" href={url} />
      </Helmet>
      <JsonLd
        data={serviceSchema({
          name: homam.name,
          description: homam.shortBenefit,
          url,
        })}
      />
      <JsonLd data={faqSchema(homam.faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Homams", url: "/homams" },
          { name: homam.name, url: `/homams/${homam.slug}` },
        ])}
      />

      {/* Hero */}
      <section className="warm-band relative isolate overflow-hidden border-b border-gold/30 text-white">
        <StarField count={45} seed={homam.order + 4} />
        <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-soft-light [background:radial-gradient(70%_55%_at_50%_-5%,rgba(255,220,140,0.5),transparent_60%)]" />
        <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <div className="[&_a]:text-[#f8ddad]/80 [&_a:hover]:text-white [&_span]:text-[#f8ddad]/55 [&_svg]:text-[#e6bd64]">
              <Breadcrumbs
                items={[
                  { name: "Home", href: "/" },
                  { name: "Homams", href: "/homams" },
                  { name: homam.name },
                ]}
              />
            </div>
            <Reveal>
              <div className="mt-5 flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br text-2xl ring-1 ring-gold/40",
                    homam.gradient
                  )}
                >
                  {homam.icon}
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="mt-5 font-serif text-4xl leading-tight text-[#fff8e8] sm:text-5xl">
                {homam.name}
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-4 max-w-xl leading-relaxed text-[#ffe6ad]">
                {homam.shortBenefit}
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mt-4 inline-flex items-center gap-2 text-sm text-[#ffd777]">
                <Clock className="h-4 w-4" /> {homam.duration}
              </div>
            </Reveal>
            <Reveal delay={0.22}>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  variant="primary" size="lg" className="w-full sm:w-auto"
                  onClick={() => setShowForm(true)}
                >
                  Book Homam
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div className="relative">
              <div className="divine-glow absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-orange-700/30 to-saffron-deep/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-gold/25 backdrop-blur-md">
                {getHomamImage(homam.slug) ? (
                  <>
                    <img
                      src={getHomamImage(homam.slug)}
                      alt={homam.name}
                      className="h-64 w-full object-cover"
                    />
                    <div className="bg-[#3a151f]/85 p-6">
                      <p className="text-sm leading-relaxed text-[#fff2d0]/80">
                        {homam.fullDescription}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-[#3a151f]/75 p-8 text-center">
                    <div
                      className={cn(
                        "mx-auto grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br text-5xl ring-2 ring-gold/40",
                        homam.gradient
                      )}
                    >
                      {homam.icon}
                    </div>
                    <p className="mt-6 text-sm leading-relaxed text-[#fff2d0]/80">
                      {homam.fullDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Benefits + Suitable for */}
      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gold/20 bg-surface/50 p-7">
            <h3 className="font-serif text-2xl text-ink">Benefits</h3>
            <IconList className="mt-6" items={homam.benefits} />
          </div>
          <div className="rounded-3xl border border-gold/20 bg-surface/50 p-7">
            <h3 className="font-serif text-2xl text-ink">Suitable For</h3>
            <IconList className="mt-6" items={homam.suitableFor} />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gold/20 bg-surface/50 p-7">
            <h3 className="font-serif text-xl text-ink">Pooja Items Included</h3>
            <IconList className="mt-5" items={homam.poojaItems} />
          </div>
          <div className="rounded-3xl border border-gold/20 bg-surface/50 p-7">
            <h3 className="font-serif text-xl text-ink">How Booking Works</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {homam.bookingInstructions}
            </p>
          </div>
        </div>
      </Section>

      {/* Booking Modal */}
      {showForm && (
        <HomamBookingModal homamName={homam.name} onClose={() => setShowForm(false)} />
      )}

      {/* FAQ */}
      <Section className="pt-0">
        <SectionHeading eyebrow="FAQ" title="Questions About This Homam" />
        <div className="mt-10">
          <FaqAccordion items={homam.faqs} />
        </div>
      </Section>

      <ContactCta />
    </>
  );
}
