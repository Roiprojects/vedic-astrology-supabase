import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/effects/Reveal";
import { StarField } from "@/components/effects/StarField";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  breadcrumbs,
  children,
  className,
  seed = 13,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  breadcrumbs?: { name: string; href?: string }[];
  children?: React.ReactNode;
  className?: string;
  seed?: number;
}) {
  return (
    <section
      className={cn(
        "warm-band relative isolate overflow-hidden border-b border-gold/30 text-white",
        className
      )}
    >
      <StarField count={45} seed={seed} />
      {/* soft top glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-soft-light [background:radial-gradient(70%_55%_at_50%_-5%,rgba(255,220,140,0.5),transparent_60%)]"
      />
      <Container className="relative py-16 text-center sm:py-20">
        {breadcrumbs && (
          <div className="mb-5 [&_a]:text-[#f8ddad]/80 [&_a:hover]:text-white [&_span]:text-[#f8ddad]/55 [&_svg]:text-[#e6bd64]">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        {eyebrow && (
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ffd777]">
              {eyebrow}
            </span>
          </Reveal>
        )}
        <Reveal delay={0.06}>
          <h1 className="mx-auto mt-3 max-w-3xl font-serif text-4xl leading-tight text-[#fff8e8] sm:text-5xl">
            {title}
          </h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={0.12}>
            <p className="mx-auto mt-4 max-w-2xl text-[#fff2d0]/85">{subtitle}</p>
          </Reveal>
        )}
        {children && (
          <Reveal delay={0.18}>
            <div className="mt-8">{children}</div>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
