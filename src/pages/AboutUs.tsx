import { Helmet } from "react-helmet-async";
import { Award, Clock, Languages, MessageSquare, Sparkles } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/effects/Reveal";
import { IconList } from "@/components/ui/IconList";
import { StarField } from "@/components/effects/StarField";
import { ContactCta } from "@/components/sections/ContactCta";
import {
  aboutContent,
  aboutStats,
  gurujiProfile,
  values,
  whyChooseUs,
} from "@/lib/data/content";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/site";

const profileRows = [
  { icon: Award, label: "Experience", value: gurujiProfile.experience },
  { icon: MessageSquare, label: "Consultation Mode", value: gurujiProfile.consultationMode },
  { icon: Languages, label: "Languages", value: gurujiProfile.languages.join(", ") },
  { icon: Clock, label: "Availability", value: gurujiProfile.availability },
];

export default function AboutUs() {
  return (
    <>
      <Helmet>
        <title>About Us — {siteConfig.name}</title>
        <meta
          name="description"
          content="Learn about Guruji — an experienced Vedic astrologer offering authentic consultations, homams, and spiritual guidance rooted in Vedic wisdom."
        />
        <link rel="canonical" href={`${siteConfig.url}/about-us`} />
      </Helmet>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "About Us", url: "/about-us" },
        ])}
      />
      <PageHero
        eyebrow="About Us"
        title="About Vedic Astrology"
        subtitle="Authentic spiritual guidance rooted in Vedic wisdom."
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "About Us" }]}
        seed={9}
      />

      {/* Brand intro */}
      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Sparkles className="mx-auto h-8 w-8 text-gold" />
          </Reveal>
          <Reveal delay={0.06}>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              {aboutContent.brandIntro}
            </p>
          </Reveal>
        </div>
      </Section>

      {/* Guruji profile */}
      <Section className="pt-0">
        <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div className="relative">
              <div className="divine-glow absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-saffron/20 to-gold/15 blur-2xl" />
              <div className="glass-card relative overflow-hidden rounded-[2rem] p-8 text-center">
                <StarField count={25} seed={3} />
                <div className="relative">
                  <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-purple-700 to-saffron-deep text-6xl ring-2 ring-gold/40">
                    🕉️
                  </div>
                  <h3 className="mt-5 font-serif text-2xl text-ink">
                    {gurujiProfile.name}
                  </h3>
                  <p className="mt-1 text-sm text-gold-light">Vedic Astrologer</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {gurujiProfile.shortBio}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <div>
            <SectionHeading
              align="left"
              eyebrow="Meet Guruji"
              title={`${gurujiProfile.name}`}
              subtitle={gurujiProfile.approach}
            />
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {profileRows.map((row) => (
                <Reveal key={row.label}>
                  <div className="flex items-start gap-3 rounded-2xl border border-gold/15 bg-surface/50 p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/10 ring-1 ring-gold/25">
                      <row.icon className="h-5 w-5 text-gold-light" />
                    </span>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-faint">
                        {row.label}
                      </dt>
                      <dd className="mt-1 text-sm text-ink">{row.value}</dd>
                    </div>
                  </div>
                </Reveal>
              ))}
            </dl>

            <div className="mt-6 rounded-2xl border border-gold/15 bg-surface/50 p-5">
              <p className="text-xs uppercase tracking-wide text-gold">Specializations</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {gurujiProfile.specialization.map((sp) => (
                  <span
                    key={sp}
                    className="rounded-full border border-gold/25 bg-[#b67a1b]/[0.04] px-3 py-1 text-xs text-muted"
                  >
                    {sp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Mission + Vision */}
      <Section className="pt-0">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl border border-gold/20 bg-gradient-to-br from-saffron/12 to-surface p-8">
              <span className="text-3xl">🎯</span>
              <h3 className="mt-4 font-serif text-2xl text-gold-light">Our Mission</h3>
              <p className="mt-3 leading-relaxed text-muted">{aboutContent.mission}</p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="h-full rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/15 to-surface p-8">
              <span className="text-3xl">🌏</span>
              <h3 className="mt-4 font-serif text-2xl text-gold-light">Our Vision</h3>
              <p className="mt-3 leading-relaxed text-muted">{aboutContent.vision}</p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Values */}
      <Section className="pt-0">
        <SectionHeading eyebrow="Our Values" title="What We Stand For" />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={(i % 3) * 0.05}>
              <div className="h-full rounded-2xl border border-gold/15 bg-surface/50 p-6 text-center transition-colors hover:border-gold/40">
                <span className="text-3xl">{v.icon}</span>
                <h3 className="mt-3 font-serif text-lg text-ink">{v.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-faint">
                  {v.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Stats */}
      <Section className="pt-0">
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-gold/20 bg-surface/40 p-8 sm:grid-cols-3 lg:grid-cols-5">
          {aboutStats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05}>
              <div className="text-center">
                <div className="font-serif text-3xl text-gold-gradient sm:text-4xl">
                  {s.value}
                </div>
                <div className="mt-1 text-xs uppercase tracking-wide text-faint">
                  {s.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Why choose us */}
      <Section className="pt-0">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Why Choose Us"
              title="Guidance You Can Trust"
              subtitle="Honest, personalized, and rooted in authentic Vedic tradition."
            />
          </div>
          <div className="rounded-3xl border border-gold/20 bg-surface/50 p-7">
            <IconList items={whyChooseUs} columns={2} />
          </div>
        </div>
      </Section>

      <ContactCta
        title="Start Your Spiritual Guidance Journey"
        subtitle="Book a consultation or chat with Guruji to begin."
      />
    </>
  );
}
