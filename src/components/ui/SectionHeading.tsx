import { cn } from "@/lib/utils";
import { Reveal } from "@/components/effects/Reveal";
import { OrnamentDivider } from "@/components/effects/OrnamentDivider";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {eyebrow && (
        <Reveal>
          <div
            className={cn(
              "mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-gold",
              align === "center" && "justify-center"
            )}
          >
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-gold/60" />
            {eyebrow}
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-gold/60" />
          </div>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className="font-serif text-3xl leading-tight text-ink sm:text-4xl md:text-[2.75rem]">
          {title}
        </h2>
      </Reveal>
      {align === "center" && (
        <Reveal delay={0.08}>
          <OrnamentDivider className="mt-5 text-gold-light/80" />
        </Reveal>
      )}
      {subtitle && (
        <Reveal delay={0.1}>
          <p
            className={cn(
              "mt-4 text-muted leading-relaxed",
              align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
