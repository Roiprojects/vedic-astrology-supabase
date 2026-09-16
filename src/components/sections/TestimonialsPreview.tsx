import { useEffect, useState } from "react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/effects/Reveal";
import { Button } from "@/components/ui/Button";
import { TestimonialCard } from "@/components/cards/TestimonialCard";
import { getFeaturedTestimonials } from "@/lib/data";
import type { Testimonial } from "@/lib/data/types";

export function TestimonialsPreview() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    getFeaturedTestimonials(6).then(setTestimonials);
  }, []);

  return (
    <Section>
      <SectionHeading
        eyebrow="Testimonials"
        title="Blessings From Those We've Guided"
        subtitle="Real experiences from people who received astrology guidance and spiritual remedies."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.id} delay={(i % 3) * 0.06}>
            <TestimonialCard t={t} />
          </Reveal>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button href="/testimonials" variant="gold" size="lg">
          Read All Testimonials
        </Button>
      </div>
    </Section>
  );
}
