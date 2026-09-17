import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  MessageCircleMore,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { PanchangaWidget } from "@/components/panchanga/PanchangaWidget";
import { useEffect, useState } from "react";
import { VedicSymbol } from "@/components/icons/VedicSymbol";
import { HomamCard } from "@/components/cards/HomamCard";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { Button } from "@/components/ui/Button";
import { AskGurujiButton } from "@/components/ai/AskGurujiButton";
import { Reveal } from "@/components/effects/Reveal";
import { Mandala } from "@/components/effects/Mandala";
import { PowerCircle } from "@/components/effects/PowerCircle";
import { CountUp } from "@/components/effects/CountUp";
import { OrnamentDivider } from "@/components/effects/OrnamentDivider";
import { Container } from "@/components/ui/Container";
import { FaqSection } from "@/components/sections/FaqSection";
import {
  getFeaturedHomams,
  getFeaturedServices,
  getFeaturedTestimonials,
  getHomeFaqs,
} from "@/lib/data";
import type { Homam, Service, Testimonial } from "@/lib/data/types";
import { gurujiProfile } from "@/lib/data/content";
import { siteConfig } from "@/lib/site";
import styles from "./TempleHome.module.css";

const pathways = [
  {
    title: "Consultations",
    note: "Personal guidance",
    kind: "consultation" as const,
    href: "/services/astrology-consultations",
  },
  {
    title: "Sacred Homams",
    note: "Authentic rituals",
    kind: "sacred-flame" as const,
    href: "/homams",
  },
  {
    title: "Birth Chart",
    note: "Detailed kundli PDF",
    kind: "birth-chart" as const,
    href: "/birth-chart-pdf",
  },
  {
    title: "Chat Guidance",
    note: "3 questions free",
    kind: "chat" as const,
    href: "/chat-with-guruji",
  },
];

const trust = [
  { value: "15+", label: "Years of guidance", icon: Clock3 },
  { value: "50K+", label: "Souls guided", icon: Sparkles },
  { value: "4.9/5", label: "Client rating", icon: Star },
  { value: "100%", label: "Confidential", icon: LockKeyhole },
];

export function TempleHome() {
  const [services, setServices] = useState<Service[]>([]);
  const [homams, setHomams] = useState<Homam[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const faqs = getHomeFaqs();

  useEffect(() => {
    let cancelled = false;
    async function loadFeaturedContent() {
      const [nextServices, nextHomams, nextTestimonials] = await Promise.all([
        getFeaturedServices(3),
        getFeaturedHomams(3),
        getFeaturedTestimonials(3),
      ]);
      if (!cancelled) {
        setServices(nextServices);
        setHomams(nextHomams);
        setTestimonials(nextTestimonials);
      }
    }
    void loadFeaturedContent();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className={`${styles.hero} relative isolate mx-3 overflow-hidden rounded-[1.5rem] text-white shadow-[0_34px_90px_-46px_rgba(28,8,10,0.75)] sm:mx-4 lg:mx-5 lg:rounded-[2.75rem]`}>
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,5,8,.28)_1px,transparent_1px)] bg-[size:80px_100%]" />

        {/* Slowly rotating cosmic mandala */}
        <div aria-hidden className="pointer-events-none absolute right-[-6rem] top-1/2 hidden h-[42rem] w-[42rem] -translate-y-1/2 text-[#ffcf7a] opacity-[0.16] lg:block">
          <Mandala className="h-full w-full animate-spin-slow" />
        </div>

        {/* Banner image (desktop) */}
        <div className="absolute right-0 top-6 bottom-6 hidden w-[38%] lg:block">
          <div aria-hidden className="absolute -inset-6 rounded-[3rem] bg-[#ffb347]/20 blur-3xl animate-glow" />
          <PowerCircle className="left-1/2 top-[28%] w-[195%]" />
          <div className={`${styles.arch} relative h-full w-full bg-gradient-to-b from-[#ffe19a] via-[#e0ad4f] to-[#b9812c] p-[4px] shadow-[0_40px_95px_-40px_rgba(18,4,7,0.95)]`}>
            <div className={`${styles.arch} relative h-full w-full overflow-hidden bg-[#481c0c]`}>
              <img
                src="/images/dakshinamurthy-hd.jpg"
                alt="Vedic rishi — spiritual guide"
                className="absolute inset-0 w-full h-full object-cover object-[50%_28%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2c1017]/35 via-transparent to-transparent" />
              <div className="absolute inset-0 shadow-[inset_0_0_50px_16px_rgba(30,8,10,0.22)]" />
            </div>
          </div>
        </div>

        <Container className="relative grid min-h-[480px] items-center py-12 lg:min-h-[calc(100svh-6.5rem)] lg:py-10">
          <div className="relative z-10 max-w-xl lg:max-w-[56%]">
            <Reveal>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#ffe6aa]">
                <span className="h-px w-10 bg-[#efc66e]" />
                Ancient wisdom · Personal clarity
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-5 max-w-[13ch] font-serif text-[clamp(2.7rem,4.8vw,5rem)] leading-[0.98] tracking-[-0.03em] text-[#fff8e8]">
                Authentic <span className="text-gold-shine animate-shimmer">Vedic Guidance</span> for Every Soul
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#fff2d0]/88 sm:text-lg">
                Personal astrology consultations, sacred homams, birth-chart analysis,
                and remedies guided by Guruji.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button href="/contact-us" size="lg" className="min-h-12 bg-[#ffd06b] px-7 text-[#351005] hover:bg-[#ffe09a]">
                  Book Consultation
                </Button>
                <AskGurujiButton className="border border-[#f2c55e]/60 bg-[#8a2c12]/70 px-7 text-[#fff1c7] hover:bg-[#a4381a]">
                  <MessageCircleMore className="h-5 w-5" /> Chat with Guruji
                </AskGurujiButton>
              </div>
            </Reveal>
          </div>

          {/* Banner image (mobile) */}
          <div className="relative mt-12 w-full lg:hidden">
            <PowerCircle className="left-1/2 top-[44%] w-[150%]" />
            <div className={`${styles.arch} relative mx-auto aspect-[4/5] max-w-sm bg-gradient-to-b from-[#f7d489] to-[#c88f34] p-[3px]`}>
              <div className={`${styles.arch} relative h-full w-full overflow-hidden bg-[#39141b]`}>
                <img
                  src="/images/dakshinamurthy-hd.jpg"
                  alt="Vedic rishi — spiritual guide"
                  className="absolute inset-0 w-full h-full object-cover object-[50%_20%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2c1017]/45 to-transparent" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="mx-3 mt-5 overflow-hidden rounded-2xl border border-[#c99737]/35 bg-[#2e1526] text-[#f8dc9d] shadow-[0_24px_60px_-42px_rgba(20,5,8,0.85)] sm:mx-4 lg:mx-5 lg:mt-7 lg:rounded-[1.75rem]">
        <Container className="grid grid-cols-2 divide-x divide-[#d4a84c]/25 lg:grid-cols-4">
          {trust.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex min-h-28 items-center gap-3 px-4 py-5 sm:px-7">
              <Icon className="h-6 w-6 shrink-0 text-[#e7b64c]" strokeWidth={1.6} />
              <div>
                <p className="font-serif text-2xl text-[#ffd778]">
                  <CountUp value={value} />
                </p>
                <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[#f5e2ba]/65">{label}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>

      <section className={`${styles.paper} py-20 text-[#35180d] sm:py-28`}>
        <Container>
          {/* Section header + Panchanga */}
          <Reveal>
            <div className="mb-14 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a8501a]">
                  Begin your journey
                </p>
                <h2 className="mt-3 font-serif text-[clamp(2.2rem,4vw,3.5rem)] leading-tight text-[#35180d]">
                  Guidance for every path
                </h2>
                <OrnamentDivider className="mt-5 text-[#b67a1b]" width="w-16" />
                <p className="mt-5 max-w-md leading-7 text-[#6b4630]">
                  Whether you seek answers, ritual blessings, or a detailed birth chart — Guruji offers the right path for your need.
                </p>
              </div>
              <PanchangaWidget />
            </div>
          </Reveal>

          {/* Pathway cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pathways.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.07}>
                <a
                  href={item.href}
                  className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-[#c8933a]/30 bg-gradient-to-b from-[#fdf3dc] to-[#f7e4b8] px-5 py-8 text-center shadow-[0_8px_32px_-12px_rgba(140,70,10,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b67a1b]/60 hover:shadow-[0_20px_48px_-14px_rgba(191,122,23,0.32)]"
                >
                  {/* Subtle radial glow on hover */}
                  <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(60%_55%_at_50%_0%,rgba(247,210,130,0.55),transparent)]" />

                  <span className="relative grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full border border-[#b67a1b]/45 bg-gradient-to-br from-[#f9e8c0] to-[#edd586] text-[#7a2f10] shadow-[0_4px_18px_-6px_rgba(191,122,23,0.45),inset_0_0_0_6px_rgba(175,104,21,0.08)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_10px_32px_-8px_rgba(191,122,23,0.6),inset_0_0_0_6px_rgba(175,104,21,0.14)]">
                    <VedicSymbol kind={item.kind} size="lg" strokeWidth={1.6} />
                  </span>

                  <h3 className="mt-5 font-serif text-xl text-[#35180d]">{item.title}</h3>
                  <p className="mt-1.5 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-[#8a5a2e]">{item.note}</p>

                  <span className="mt-5 flex h-7 w-7 items-center justify-center rounded-full border border-[#b67a1b]/40 bg-[#f0d08a]/60 text-[#7a3a10] transition-all duration-300 group-hover:border-[#b67a1b] group-hover:bg-[#e8b94a] group-hover:text-white">
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </a>
              </Reveal>
            ))}
          </div>

          <div className="mt-24 grid items-end gap-8 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a8501a]">One-to-one guidance</p>
              <span aria-hidden className="mt-4 block h-px w-16 bg-gradient-to-r from-[#b67a1b]/80 to-transparent" />
              <h2 className="mt-4 max-w-[11ch] font-serif text-[clamp(2.7rem,5vw,5rem)] leading-[0.95] tracking-[-0.035em]">Clarity for life&apos;s important questions</h2>
              <p className="mt-5 max-w-md leading-7 text-[#684a37]">Each consultation studies the relevant planets, houses, doshas, and practical spiritual remedies—not a generic horoscope.</p>
              <Button href="/services/astrology-consultations" variant="gold" size="lg" className="mt-7">View all services</Button>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {services.map((service) => <ServiceCard key={service.slug} service={service} />)}
            </div>
            <div className="mt-8 text-center">
              <Button href="/services" variant="gold" size="lg">View all services</Button>
            </div>
          </div>
        </Container>
      </section>

      <section className={`${styles.night} relative overflow-hidden py-24 text-[#fff0c7] sm:py-32`}>
        <Container>
          <div className="grid gap-14 lg:grid-cols-[.78fr_1.22fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#e8b952]">Purify · Align · Transform</p>
              <span aria-hidden className="mt-4 block h-px w-16 bg-gradient-to-r from-[#e8b952]/80 to-transparent" />
              <h2 className="mt-4 max-w-[10ch] font-serif text-[clamp(3rem,5vw,5.7rem)] leading-[0.94] tracking-[-0.04em]">Sacred homams for divine blessings</h2>
              <p className="mt-6 max-w-md leading-7 text-[#eadcbf]/72">Authentic Vedic fire rituals for prosperity, peace, protection, health, and new beginnings.</p>
              <Button href="/homams" size="lg" className="mt-8 bg-[#cf641e] text-white hover:bg-[#e17827]">View all homas</Button>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {homams.map((homam) => <HomamCard key={homam.slug} homam={homam} />)}
            </div>
            <div className="mt-8 text-center">
              <Button href="/homams" variant="gold" size="lg">View all homams</Button>
            </div>
          </div>
        </Container>
      </section>

      <section className={`${styles.paper} py-24 sm:py-32`}>
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[.86fr_1.14fr]">
            <div className="relative mx-auto w-full max-w-[420px] pb-8">
              <div aria-hidden className="absolute -inset-5 rounded-full bg-gradient-to-br from-[#f0842e]/22 to-[#c1912f]/12 blur-2xl" />
              <div className="relative mx-auto aspect-square overflow-hidden rounded-full border-[6px] border-[#f3e0b4] ring-1 ring-[#9c6a15]/40 shadow-[0_34px_74px_-30px_rgba(74,15,26,.55)] bg-gradient-to-br from-[#f5e6c8] to-[#e8c88a]">
                <img
                  src="/images/rishi.jpg"
                  alt="Guruji, Vedic astrologer"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              </div>
            </div>
            <div>
              <span aria-hidden className="block h-px w-16 bg-gradient-to-r from-[#b67a1b]/80 to-transparent" />
              <h2 className="mt-4 font-serif text-[clamp(3rem,5vw,5.5rem)] leading-[0.95] text-[#35180d]">Guidance rooted in devotion and honesty</h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#684a37]">{gurujiProfile.longBio}</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {gurujiProfile.specialization.slice(0, 6).map((item) => (
                  <p key={item} className="flex items-center gap-2 text-sm text-[#5d3d2d]"><CheckCircle2 className="h-4 w-4 text-[#b15a1a]" />{item}</p>
                ))}
              </div>
              <Button href="/about-us" variant="gold" size="lg" className="mt-8">Know Guruji</Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#cc5a16] py-24 text-white sm:py-28">
        <div aria-hidden className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,#ffd67a_1px,transparent_1px)] [background-size:28px_28px]" />
        <Container className="relative grid items-center gap-12 lg:grid-cols-[1fr_.82fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ffe0a2]">Automated service guide</p>
            <span aria-hidden className="mt-4 block h-px w-16 bg-gradient-to-r from-[#ffe0a2]/80 to-transparent" />
            <h2 className="mt-4 max-w-[12ch] font-serif text-[clamp(3rem,5vw,5.5rem)] leading-[0.94]">Ask three questions. Continue with Guruji when it matters.</h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#fff2dc]/85">Guruji Assistant can explain services, doshas, homams, remedies, and birth-chart basics. For personal analysis, it hands you directly to Guruji.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <AskGurujiButton className="bg-[#7a1f14] text-[#ffe1a0] hover:bg-[#94271a]"><MessageCircleMore className="h-5 w-5" />Ask Guruji</AskGurujiButton>
              <Button href="/contact-us" variant="ghost" size="lg" className="border border-[#ffe0a2]/60 text-white">Book Consultation</Button>
            </div>
          </div>
          <div className="border border-[#f8d487]/60 bg-[#39152a] p-5 shadow-[0_30px_80px_-35px_rgba(43,8,8,.9)] sm:p-7">
            <div className="flex items-center gap-3 border-b border-[#d7a94e]/25 pb-5">
              <img src="/images/dakshinamurthy-hd.jpg" alt="" width={52} height={52} className="h-13 w-13 rounded-full object-cover object-[50%_20%] ring-2 ring-[#d8a94a]" />
              <div><p className="font-serif text-xl text-[#ffe1a0]">Guruji Assistant</p><p className="text-xs text-[#f0d7ad]/60">Automated astrology assistant · 3 free questions</p></div>
            </div>
            <div className="space-y-3 py-6">
              {["Which consultation is right for my career?", "What does Navagraha Homam help with?", "What details are needed for my birth chart?"].map((q) => (
                <div key={q} className="rounded-2xl border border-[#e0b65b]/20 bg-white/[0.04] px-4 py-3 text-sm text-[#f8e9ca]">{q}</div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#f0d7ad]/60"><ShieldCheck className="h-4 w-4" />Guidance is indicative and never a guarantee.</div>
          </div>
        </Container>
      </section>

      <section className={`${styles.paper} py-24 sm:py-28`}>
        <Container>
          <Reveal>
            <div className="mb-14 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a8501a]">
                Blessings received
              </p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,3.6vw,3.25rem)] leading-tight text-[#35180d]">
                What seekers say
              </h2>
              <OrnamentDivider className="mt-5 text-[#b67a1b]" width="w-16" />
            </div>
          </Reveal>
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((item, i) => (
              <Reveal key={item.id} delay={(i % 3) * 0.08} className="h-full">
                <figure className="group relative flex h-full flex-col rounded-3xl border border-[#c9993a]/30 bg-[#fff9ec] p-7 shadow-[0_20px_50px_-34px_rgba(74,15,26,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c9993a]/55 hover:shadow-[0_28px_64px_-30px_rgba(74,15,26,0.42)]">
                  <Quote className="absolute right-6 top-6 h-9 w-9 text-[#c9993a]/25" />
                  <div className="flex gap-1 text-[#bf7a17]">
                    {Array.from({ length: item.rating }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="mt-5 flex-1 font-serif text-lg leading-relaxed text-[#4b2b1b]">
                    &ldquo;{item.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-[#c9993a]/20 pt-5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#e8a94a] to-[#c06a1e] font-serif text-lg text-white">
                      {item.avatarInitial}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#35180d]">{item.name}</span>
                      <span className="block text-xs text-[#79543d]">{item.location}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <FaqSection items={faqs} subtitle="Everything to know before beginning your consultation." />

      <section className="bg-[#2e1526] py-20 text-center text-[#f7e7bf]">
        <Container>
          <h2 className="font-serif text-[clamp(2.8rem,5vw,5rem)] text-[#ffe0a0]">Ready for personal guidance?</h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#eadbbd]/70">Speak with Guruji for a confidential consultation rooted in authentic Vedic practice.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button href="/contact-us" size="lg">Book Consultation</Button></div>
          <p className="mx-auto mt-10 max-w-3xl border-t border-[#d5a94f]/20 pt-6 text-xs leading-5 text-[#eadbbd]/55">{siteConfig.disclaimer}</p>
        </Container>
      </section>
    </>
  );
}
