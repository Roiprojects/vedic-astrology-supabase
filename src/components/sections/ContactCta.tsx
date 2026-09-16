import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/effects/Reveal";
import { StarField } from "@/components/effects/StarField";
import { siteConfig } from "@/lib/site";

export function ContactCta({
  title = "Need Guidance Today?",
  subtitle = "Speak with Guruji for personalized Vedic astrology guidance.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="relative py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-[2.5rem] border border-gold/25 bg-gradient-to-br from-saffron/15 via-gold/10 to-surface p-10 text-center sm:p-14">
          <StarField count={40} seed={21} />
          <div className="relative">
            <Reveal>
              <h2 className="font-serif text-3xl text-ink sm:text-4xl md:text-5xl">
                {title}
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mx-auto mt-4 max-w-xl text-muted">{subtitle}</p>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  href="/contact-us"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Book Consultation
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
