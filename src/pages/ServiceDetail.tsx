import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Clock, MessageCircleMore } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { AskGurujiButton } from "@/components/ai/AskGurujiButton";
import { PriceBadge } from "@/components/ui/Badge";
import { IconList } from "@/components/ui/IconList";
import { Reveal } from "@/components/effects/Reveal";
import { StarField } from "@/components/effects/StarField";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactCta } from "@/components/sections/ContactCta";
import { getServiceBySlug } from "@/lib/data";
import { useConsultation } from "@/components/booking/ConsultationContext";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  JsonLd,
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
} from "@/components/seo/JsonLd";

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Awaited<ReturnType<typeof getServiceBySlug>> | null>(null);
  const [loading, setLoading] = useState(true);
  const { openConsultation } = useConsultation();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!slug) return;
      const data = await getServiceBySlug(slug);
      if (!cancelled) {
        setService(data ?? null);
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

  if (!service) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-gold-gradient">404</h1>
          <p className="mt-4 text-muted">Service not found.</p>
          <a href="/services" className="mt-6 inline-block text-gold-light underline">
            Back to services
          </a>
        </div>
      </div>
    );
  }

  const url = `${siteConfig.url}/services/${service.slug}`;

  return (
    <>
      <Helmet>
        <title>{service.title} — {siteConfig.name}</title>
        <meta name="description" content={service.shortDescription} />
        <link rel="canonical" href={url} />
      </Helmet>
      <JsonLd
        data={serviceSchema({
          name: service.title,
          description: service.shortDescription,
          price: service.price,
          url,
        })}
      />
      <JsonLd data={faqSchema(service.faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: "Consultations", url: "/services/astrology-consultations" },
          { name: service.title, url: `/services/${service.slug}` },
        ])}
      />

      {/* Hero */}
      <section className="warm-band relative isolate overflow-hidden border-b border-gold/30 text-white">
        <StarField count={45} seed={service.order + 3} />
        <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-soft-light [background:radial-gradient(70%_55%_at_50%_-5%,rgba(255,220,140,0.5),transparent_60%)]" />
        <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <div className="[&_a]:text-[#f8ddad]/80 [&_a:hover]:text-white [&_span]:text-[#f8ddad]/55 [&_svg]:text-[#e6bd64]">
              <Breadcrumbs
                items={[
                  { name: "Home", href: "/" },
                  { name: "Services", href: "/services" },
                  { name: service.title },
                ]}
              />
            </div>
            <Reveal>
              <div className="mt-5 flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br text-2xl ring-1 ring-gold/40",
                    service.gradient
                  )}
                >
                  {service.icon}
                </span>
                <PriceBadge price={service.price} discountPrice={service.discountPrice} />
              </div>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="mt-5 font-serif text-4xl leading-tight text-[#fff8e8] sm:text-5xl">
                {service.title}
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-4 max-w-xl leading-relaxed text-[#fff2d0]/85">
                {service.shortDescription}
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mt-4 inline-flex items-center gap-2 text-sm text-[#ffd777]">
                <Clock className="h-4 w-4" /> {service.duration}
              </div>
            </Reveal>
            <Reveal delay={0.22}>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  variant="primary" size="lg" className="w-full sm:w-auto"
                  onClick={() => service && openConsultation({
                    slug: service.slug,
                    title: service.title,
                    price: service.price,
                    discountPrice: service.discountPrice,
                    duration: service.duration,
                    icon: service.icon,
                  })}
                >
                  Book Consultation
                </Button>
                <AskGurujiButton serviceTitle={service.title} className="w-full justify-center border border-[#f2c55e]/60 bg-[#8a2c12]/70 text-[#fff1c7] hover:bg-[#a4381a] sm:w-auto">
                  <MessageCircleMore className="h-5 w-5" /> Ask Guruji
                </AskGurujiButton>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div className="relative">
              <div className="divine-glow absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-saffron/25 to-gold/15 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-gold/25 backdrop-blur-md">
                {service.image ? (
                  <>
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-64 w-full object-cover"
                    />
                    <div className="bg-[#3a151f]/85 p-6">
                      <p className="text-sm leading-relaxed text-[#fff2d0]/80">
                        {service.fullDescription}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-[#3a151f]/75 p-8 text-center">
                    <div
                      className={cn(
                        "mx-auto grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br text-5xl ring-2 ring-gold/40",
                        service.gradient
                      )}
                    >
                      {service.icon}
                    </div>
                    <p className="mt-6 text-sm leading-relaxed text-[#fff2d0]/80">
                      {service.fullDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Problem */}
      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            align="left"
            eyebrow="Understanding the Problem"
            title="Are You Facing This?"
          />
          <p className="mt-5 leading-relaxed text-muted">{service.problem}</p>
        </div>
      </Section>

      {/* Analysis + Receive */}
      <Section className="pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gold/20 bg-surface/50 p-7">
            <h3 className="font-serif text-2xl text-ink">Astrology Analysis Included</h3>
            <p className="mt-2 text-sm text-faint">
              What Guruji examines in your birth chart for this concern.
            </p>
            <IconList className="mt-6" items={service.analysis} />
          </div>
          <div className="rounded-3xl border border-gold/20 bg-surface/50 p-7">
            <h3 className="font-serif text-2xl text-ink">What You Will Receive</h3>
            <p className="mt-2 text-sm text-faint">
              Everything included with your consultation.
            </p>
            <IconList className="mt-6" items={service.receive} />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gold/20 bg-surface/50 p-7">
            <h3 className="font-serif text-xl text-ink">Key Benefits</h3>
            <IconList className="mt-5" items={service.benefits} />
          </div>
          <div className="rounded-3xl border border-gold/20 bg-surface/50 p-7">
            <h3 className="font-serif text-xl text-ink">Remedies & Support</h3>
            <IconList className="mt-5" items={service.remedies} />
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="pt-0">
        <SectionHeading eyebrow="FAQ" title="Questions About This Service" />
        <div className="mt-10">
          <FaqAccordion items={service.faqs} />
        </div>
      </Section>

      <ContactCta />
    </>
  );
}
