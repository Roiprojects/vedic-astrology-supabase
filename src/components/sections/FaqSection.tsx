import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import type { Faq } from "@/lib/data/types";

export function FaqSection({
  items,
  eyebrow = "FAQ",
  title = "Frequently Asked Questions",
  subtitle,
}: {
  items: Faq[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <Section>
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <div className="mt-12">
        <FaqAccordion items={items} />
      </div>
    </Section>
  );
}
