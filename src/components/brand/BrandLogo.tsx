import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

export function BrandLogo({
  showText = true,
  size = 50,
  href = "/",
  className,
  compact = false,
}: {
  showText?: boolean;
  size?: number;
  href?: string | null;
  className?: string;
  compact?: boolean;
}) {
  const emblem = (
    <span
      className="relative shrink-0 overflow-hidden rounded-full ring-2 ring-gold/70 shadow-[0_0_0_1px_rgba(255,255,255,0.65),0_8px_22px_-6px_rgba(189,71,29,0.55)]"
      style={{ width: size, height: size }}
    >
      <img
        src="/logo-mark.png"
        alt={`${siteConfig.name} logo`}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* subtle inner sheen so the gold emblem lifts off the navbar */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-gold/40"
      />
    </span>
  );

  const text = showText && (
    <span className="flex flex-col leading-none">
      <span className="font-display text-[0.95rem] font-semibold uppercase tracking-[0.18em] text-gold-light sm:text-base">
        Vedic Astrology
      </span>
      {!compact && (
        <span className="mt-1 text-[0.6rem] uppercase tracking-[0.32em] text-muted/80">
          {siteConfig.tagline}
        </span>
      )}
    </span>
  );

  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {emblem}
      {text}
    </span>
  );

  if (href) {
    return (
      <a href={href} aria-label={`${siteConfig.name} home`} className="inline-flex">
        {content}
      </a>
    );
  }
  return content;
}
