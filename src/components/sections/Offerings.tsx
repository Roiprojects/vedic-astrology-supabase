import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/effects/Reveal";
import { offerings } from "@/lib/data/content";
import { cn } from "@/lib/utils";

export function Offerings() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Divine Guidance"
        title="Ways to Begin Your Journey"
        subtitle="Choose the path that calls to you — live guidance, a detailed report, sacred rituals, or premium consultations."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {offerings.map((o, i) => (
          <Reveal key={o.title} delay={i * 0.06}>
            <a
              href={o.href}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gold/20 bg-surface/60 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-[var(--shadow-glow-gold)]"
            >
              <div
                className={cn(
                  "pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-40 blur-2xl transition-opacity group-hover:opacity-70",
                  o.gradient
                )}
              />
              <div
                className={cn(
                  "grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br text-2xl ring-1 ring-gold/25",
                  o.gradient
                )}
              >
                {o.icon}
              </div>
              <h3 className="relative mt-5 font-serif text-xl text-ink">{o.title}</h3>
              <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted">
                {o.description}
              </p>
              {o.price && (
                <p className="relative mt-3 text-sm font-semibold text-gold-light">
                  From {o.price}
                </p>
              )}
              <span className="relative mt-5 inline-flex items-center gap-2 text-sm font-medium text-gold-light">
                {o.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
