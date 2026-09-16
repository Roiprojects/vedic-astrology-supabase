import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/effects/Reveal";
import { processSteps } from "@/lib/data/content";

export function HowItWorks() {
  return (
    <Section className="relative">
      <SectionHeading
        eyebrow="How It Works"
        title="Your Path to Guidance in 6 Simple Steps"
        subtitle="From choosing a service to receiving your personalized guidance — a smooth, guided journey."
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {processSteps.map((step, i) => (
          <Reveal key={step.step} delay={(i % 3) * 0.06}>
            <div className="relative h-full rounded-3xl border border-gold/20 bg-surface/50 p-6">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-purple-700/60 to-saffron-deep/50 text-2xl ring-1 ring-gold/25">
                  {step.icon}
                </span>
                <span className="font-serif text-4xl text-gold/25">
                  {String(step.step).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 font-serif text-lg text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
