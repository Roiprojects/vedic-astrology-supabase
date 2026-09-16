import { Section } from "@/components/ui/Section";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export function LegalContent({
  sections,
  lastUpdated,
}: {
  sections: LegalSection[];
  lastUpdated: string;
}) {
  return (
    <Section>
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-faint">Last updated: {lastUpdated}</p>
        <div className="mt-8 space-y-8">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="font-serif text-2xl text-gold-light">{s.heading}</h2>
              {s.paragraphs.map((p, i) => (
                <p key={i} className="mt-3 text-sm leading-relaxed text-muted">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
