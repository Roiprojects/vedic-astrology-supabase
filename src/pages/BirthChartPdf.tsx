import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Clock, FileText, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IconList } from "@/components/ui/IconList";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { ContactCta } from "@/components/sections/ContactCta";
import { getPageContent } from "@/lib/data";
import { PriceBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useConsultation } from "@/components/booking/ConsultationContext";
import { JsonLd, breadcrumbSchema, faqSchema, serviceSchema } from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/site";

const highlights = [
  { icon: FileText, title: "Detailed Report", text: "A comprehensive Vedic kundli PDF." },
  { icon: Clock, title: "24–48 Hours", text: "Delivered to your email / WhatsApp." },
  { icon: ShieldCheck, title: "100% Private", text: "Your details stay confidential." },
];

export default function BirthChartPdfPage() {
  const [content, setContent] = useState<Awaited<ReturnType<typeof getPageContent>> | null>(null);
  const [loading, setLoading] = useState(true);
  const { openConsultation } = useConsultation();

  useEffect(() => {
    getPageContent("birth-chart-pdf")
      .then(setContent)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !content) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Birth Chart PDF — {siteConfig.name}</title>
        <meta
          name="description"
          content="Get a detailed Vedic kundli (birth chart) PDF report prepared from your exact birth details — including Lagna chart, doshas, remedies, and life guidance."
        />
        <link rel="canonical" href={`${siteConfig.url}/birth-chart-pdf`} />
      </Helmet>
      <JsonLd
        data={serviceSchema({
          name: "Birth Chart PDF Report",
          description:
            "A detailed Vedic kundli report prepared from your birth details.",
          price: content.price ?? 500,
          url: `${siteConfig.url}/birth-chart-pdf`,
        })}
      />
      <JsonLd data={faqSchema(content.faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Birth Chart PDF", url: "/birth-chart-pdf" },
        ])}
      />

      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        subtitle={content.subtitle}
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Birth Chart PDF" }]}
        seed={19}
      >
        <div className="flex items-center justify-center gap-3">
          {content.price != null && <PriceBadge price={content.price} />}
          {content.priceNote && <span className="text-sm text-faint">{content.priceNote}</span>}
        </div>
      </PageHero>

      <Section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="flex items-center gap-3 rounded-2xl border border-gold/15 bg-surface/50 p-5"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/10 ring-1 ring-gold/25">
                <h.icon className="h-5 w-5 text-gold-light" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{h.title}</p>
                <p className="text-xs text-faint">{h.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-gold/20 bg-surface/50 p-7">
            <SectionHeading align="left" eyebrow="Included" title="Your Report Includes" />
            <IconList className="mt-6" items={content.includes} columns={2} />
          </div>

          <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-gold/25 bg-surface/60 p-8 text-center">
            <div className="text-5xl">📄</div>
            <div>
              <h3 className="font-serif text-2xl text-ink">Get Your Birth Chart PDF</h3>
              <p className="mt-2 text-sm text-muted">
                Detailed Vedic kundli delivered to your email within 24–48 hours.
              </p>
              {content.price != null && (
                <p className="mt-3 text-2xl font-bold text-gold-light">
                  ₹{content.price.toLocaleString("en-IN")}
                </p>
              )}
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => openConsultation({
                slug: "birth-chart-pdf",
                title: "Birth Chart PDF",
                price: content.price ?? 2000,
                duration: "24–48 hrs delivery",
                icon: "📄",
              })}
            >
              Book Birth Chart PDF
            </Button>
            <p className="text-xs text-faint">Fill details → Pay → Receive PDF on email / WhatsApp</p>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading eyebrow="FAQ" title="Birth Chart Questions" />
        <div className="mt-10">
          <FaqAccordion items={content.faqs} />
        </div>
      </Section>

      <ContactCta />
    </>
  );
}
