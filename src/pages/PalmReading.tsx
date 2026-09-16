import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Camera, Hand, ScanLine, Sparkles } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/effects/Reveal";
import { PalmReader } from "@/components/ai/PalmReader";
import { ContactCta } from "@/components/sections/ContactCta";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { getPageContent } from "@/lib/data";
import { siteConfig } from "@/lib/site";

const steps = [
  { icon: Camera, title: "Take a Photo", text: "Snap a clear, well-lit photo of your open palm." },
  { icon: ScanLine, title: "Line Analysis", text: "Our reader studies your heart, head, life & fate lines." },
  { icon: Sparkles, title: "Get Your Reading", text: "Receive guidance on love, career, health & fortune." },
];

export default function PalmReadingPage() {
  const [content, setContent] = useState<Awaited<ReturnType<typeof getPageContent>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPageContent("palm-reading")
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
        <title>Instant Palm Reader — {siteConfig.name}</title>
        <meta
          name="description"
          content="Upload a photo of your palm and receive an instant Vedic palmistry reading covering love, career, vitality, and fortune."
        />
        <link rel="canonical" href={`${siteConfig.url}/palm-reading`} />
      </Helmet>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Instant Palm Reader", url: "/palm-reading" },
        ])}
      />
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        subtitle={content.subtitle}
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Instant Palm Reader" }]}
        seed={33}
      >
        <div className="flex items-center justify-center gap-2">
          <Badge>
            <Hand className="h-3.5 w-3.5" /> Instant · Private · Free
          </Badge>
        </div>
      </PageHero>

      <Section className="pb-0">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <div className="flex items-center gap-3 rounded-2xl border border-gold/15 bg-surface/50 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/10 ring-1 ring-gold/25">
                  <s.icon className="h-5 w-5 text-gold-light" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{s.title}</p>
                  <p className="text-xs text-faint">{s.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <PalmReader />
      </Section>

      <ContactCta
        title="Want a Deeper Reading?"
        subtitle="Book a personal consultation with Guruji for a complete Vedic analysis."
      />
    </>
  );
}
