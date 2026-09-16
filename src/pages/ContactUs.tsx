import { Helmet } from "react-helmet-async";
import { Clock, Mail, MapPin } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { BookingForm } from "@/components/forms/BookingForm";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { contactFaqs } from "@/lib/data/faqs";
import { siteConfig } from "@/lib/site";
import { JsonLd, breadcrumbSchema, localBusinessSchema } from "@/components/seo/JsonLd";

const contactCards = [
  { icon: Mail, label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
  { icon: MapPin, label: "Location", value: siteConfig.location },
  { icon: Clock, label: "Working Hours", value: siteConfig.workingHours },
];

export default function ContactUsPage() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    siteConfig.mapQuery
  )}&output=embed`;

  return (
    <>
      <Helmet>
        <title>Contact Us — {siteConfig.name}</title>
        <meta
          name="description"
          content="Contact Vedic Astrology — speak with Guruji for astrology consultation, homam booking, or a kundli report via phone, WhatsApp, or email."
        />
        <link rel="canonical" href={`${siteConfig.url}/contact-us`} />
      </Helmet>
      <JsonLd data={localBusinessSchema()} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Contact Us", url: "/contact-us" },
        ])}
      />

      <PageHero
        eyebrow="Get in Touch"
        title="Contact Vedic Astrology"
        subtitle="Speak with Guruji for astrology consultation, homam booking, or kundli report."
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Contact Us" }]}
        seed={31}
      >
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href={`mailto:${siteConfig.email}`} variant="gold" size="lg">
            <Mail className="h-5 w-5" /> Email Us
          </Button>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Info + map */}
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              {contactCards.map((c) => {
                const Inner = (
                  <div className="flex h-full items-start gap-3 rounded-2xl border border-gold/15 bg-surface/50 p-5 transition-colors hover:border-gold/40">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/10 ring-1 ring-gold/25">
                      <c.icon className="h-5 w-5 text-gold-light" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-faint">{c.label}</p>
                      <p className="mt-1 text-sm text-ink">{c.value}</p>
                    </div>
                  </div>
                );
                return c.href ? (
                  <a
                    key={c.label}
                    href={c.href}
                    target={"external" in c && c.external ? "_blank" : undefined}
                    rel={"external" in c && c.external ? "noopener noreferrer" : undefined}
                  >
                    {Inner}
                  </a>
                ) : (
                  <div key={c.label}>{Inner}</div>
                );
              })}
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-gold/20">
              <iframe
                title="Location map"
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-64 w-full grayscale-[0.3]"
              />
            </div>
          </div>

          {/* Form */}
          <div className="rounded-3xl border border-gold/25 bg-surface/60 p-6 sm:p-8">
            <BookingForm variant="contact" subject="Contact Enquiry" />
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading eyebrow="FAQ" title="Before You Reach Out" />
        <div className="mt-10">
          <FaqAccordion items={contactFaqs} />
        </div>
      </Section>

      {/* Disclaimer */}
      <Section className="pt-0">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gold/15 bg-[#b67a1b]/[0.025] p-6 text-center">
          <p className="text-sm leading-relaxed text-faint">
            <span className="font-semibold text-muted">Disclaimer: </span>
            {siteConfig.disclaimer}
          </p>
        </div>
      </Section>
    </>
  );
}
