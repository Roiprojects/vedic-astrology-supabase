import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/effects/Reveal";
import { trustHighlights } from "@/lib/data/content";

export function TrustHighlights() {
  return (
    <Section className="py-14 sm:py-16">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {trustHighlights.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.05}>
            <div className="group flex h-full flex-col items-center rounded-2xl border border-gold/15 bg-surface/50 p-5 text-center transition-colors hover:border-gold/40">
              <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                {item.icon}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-gold-light">
                {item.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-faint">
                {item.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
