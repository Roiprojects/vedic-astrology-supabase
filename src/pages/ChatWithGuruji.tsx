import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Gift, Lock, MessagesSquare, Sparkles } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/effects/Reveal";
import { Button } from "@/components/ui/Button";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { BookingForm } from "@/components/forms/BookingForm";
import { ContactCta } from "@/components/sections/ContactCta";
import { getPageContent } from "@/lib/data";
import { siteConfig } from "@/lib/site";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/seo/JsonLd";

const features = [
  { icon: Gift, title: "3 Free Questions", text: "Ask three introductory questions about services, homams, remedies, or birth charts." },
  { icon: MessagesSquare, title: "Automated Service Guide", text: "Get concise automated guidance before choosing a personal consultation." },
  { icon: Lock, title: "Confidential", text: "Your conversation stays completely private." },
  { icon: Sparkles, title: "Continue with Guruji", text: "Move from automated guidance to a personal session via WhatsApp, UPI, or Razorpay." },
];

export default function ChatWithGurujiPage() {
  const [content, setContent] = useState<Awaited<ReturnType<typeof getPageContent>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPageContent("chat-with-guruji")
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
        <title>Chat with Guruji — {siteConfig.name}</title>
        <meta
          name="description"
          content="Get live Vedic guidance directly from Guruji. First few messages free, then continue with a paid consultation. Confidential and convenient."
        />
        <link rel="canonical" href={`${siteConfig.url}/chat-with-guruji`} />
      </Helmet>
      <JsonLd data={faqSchema(content.faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Chat with Guruji", url: "/chat-with-guruji" },
        ])}
      />

      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        subtitle={content.subtitle}
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Chat with Guruji" }]}
        seed={23}
      >
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <span className="inline-flex items-center gap-2 rounded-full border border-online/40 bg-online/10 px-4 py-1.5 text-sm text-online">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-online opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-online" />
            </span>
            Guruji is Available Now
          </span>
          <Button href="/contact-us" variant="gold" size="lg">
            Book Consultation
          </Button>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-gold/15 bg-surface/50 p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold/10 ring-1 ring-gold/25">
                  <f.icon className="h-5 w-5 text-gold-light" />
                </span>
                <h3 className="mt-4 font-serif text-lg text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="mx-auto max-w-3xl rounded-3xl border border-gold/25 bg-surface/60 p-6 sm:p-9">
          <BookingForm variant="chat" subject="Chat with Guruji" />
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading eyebrow="FAQ" title="Chat Consultation Questions" />
        <div className="mt-10">
          <FaqAccordion items={content.faqs} />
        </div>
      </Section>

      <ContactCta
        title="Ready to Chat with Guruji?"
        subtitle="Ask three free questions, then continue personally with Guruji."
      />
    </>
  );
}
