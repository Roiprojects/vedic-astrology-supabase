import { CheckCircle2 } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/effects/Reveal";
import { Button } from "@/components/ui/Button";
import { StarField } from "@/components/effects/StarField";
import { gurujiProfile, homeStats } from "@/lib/data/content";

export function AboutPreview() {
  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* Visual */}
        <Reveal>
          <div className="relative">
            <div className="divine-glow absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-saffron/20 to-gold/15 blur-2xl" />
            <div className="glass-card relative overflow-hidden rounded-[2rem] p-8">
              <StarField count={30} seed={5} />
              <div className="relative flex flex-col items-center text-center">
                <div className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-purple-700 to-saffron-deep text-5xl ring-2 ring-gold/40">
                  🕉️
                </div>
                <h3 className="mt-5 font-serif text-2xl text-ink">
                  {gurujiProfile.name}
                </h3>
                <p className="mt-1 text-sm text-gold-light">
                  Vedic Astrologer · {gurujiProfile.experience}
                </p>
                <div className="mt-6 grid w-full grid-cols-2 gap-3">
                  {homeStats.slice(0, 4).map((s) => (
                    <div
                      key={s.label}
                      className="rounded-2xl border border-gold/15 bg-[#b67a1b]/[0.035] px-3 py-3"
                    >
                      <div className="font-serif text-xl text-gold-light">
                        {s.value}
                      </div>
                      <div className="text-[0.65rem] uppercase tracking-wide text-faint">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Content */}
        <div>
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
              About Guruji
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
              About {gurujiProfile.name}
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 leading-relaxed text-muted">
              {gurujiProfile.longBio}
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {gurujiProfile.specialization.slice(0, 6).map((sp) => (
                <li key={sp} className="flex items-center gap-2 text-sm text-muted">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" />
                  {sp}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/about-us" variant="primary" size="lg">
                Read More
              </Button>
              <Button href="/chat-with-guruji" variant="gold" size="lg">
                Chat with Guruji
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
