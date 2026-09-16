import { Sparkles, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/effects/Reveal";
import { StarField } from "@/components/effects/StarField";
import { heroContent, homeStats } from "@/lib/data/content";
import { siteConfig } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <StarField count={70} seed={11} />

      <Container className="relative grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        {/* Left — headline + CTAs */}
        <div className="text-center lg:text-left">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-[#b67a1b]/[0.04] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-gold-light">
              <Sparkles className="h-3.5 w-3.5" />
              {siteConfig.tagline}
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 font-serif text-4xl leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
              Authentic <span className="text-gold-gradient">Vedic Astrology</span>{" "}
              Guidance for Every Soul
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted lg:mx-0 lg:text-lg">
              {heroContent.subtitle}
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap lg:justify-start">
              <Button href="/contact-us" variant="primary" size="lg" className="w-full sm:w-auto">
                Book Consultation
              </Button>
              <Button href="/services" variant="gold" size="lg" className="w-full sm:w-auto">
                View Services
              </Button>
            </div>
          </Reveal>

          {/* mini stats */}
          <Reveal delay={0.32}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 lg:justify-start">
              {homeStats.slice(0, 3).map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <div className="font-serif text-2xl text-gold-light">{s.value}</div>
                  <div className="text-xs uppercase tracking-wide text-faint">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Right — Dakshinamurthy divine image */}
        <Reveal delay={0.2} className="mx-auto w-full max-w-sm">
          <div className="relative animate-float">
            {/* Outer glow */}
            <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-saffron/30 to-gold/20 blur-3xl" />

            {/* Golden ring frame */}
            <div className="relative mx-auto aspect-square w-full max-w-[360px] rounded-full border-[5px] border-[#d4a017] p-1.5 shadow-[0_30px_80px_-20px_rgba(74,15,26,0.55)] ring-1 ring-[#f5c842]/30">
              <div className="relative h-full w-full overflow-hidden rounded-full bg-[#2a0e18]">
                <img
                  src="/images/dakshinamurthy-hd.jpg"
                  alt="Lord Dakshinamurthy — Shiva as the cosmic teacher of Vedic wisdom"
                  className="h-full w-full object-cover object-[50%_18%]"
                />
                {/* Subtle inner vignette */}
                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_60px_20px_rgba(20,5,10,0.28)]" />
              </div>
            </div>

            {/* Name label below the image */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-gold/40 bg-[#fff9e9] px-6 py-2.5 shadow-[0_10px_28px_-12px_rgba(74,15,26,.4)]">
              <p className="font-serif text-base leading-none text-[#35180d]">
                Lord Dakshinamurthy
              </p>
            </div>

            {/* Rating badge */}
            <div className="absolute -right-4 top-6 flex items-center gap-1.5 rounded-2xl border border-gold/30 bg-overlay/90 px-3 py-2 shadow-md backdrop-blur-sm">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                ))}
              </div>
              <span className="text-xs text-muted">50K+ guided</span>
            </div>

            {/* Online badge */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-full border border-online/40 bg-overlay/90 px-3 py-1.5 shadow-md backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-online opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-online" />
              </span>
              <span className="text-xs font-medium text-online">Available Now</span>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
