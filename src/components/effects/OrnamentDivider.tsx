import { cn } from "@/lib/utils";

/**
 * Small ornamental gold flourish — a hairline rule with a central diamond
 * motif. Colour via currentColor (default gold). Used under section eyebrows
 * and between sections for a temple/luxury feel.
 */
export function OrnamentDivider({
  className,
  width = "w-14",
}: {
  className?: string;
  width?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center gap-2.5 text-gold", className)} aria-hidden>
      <span className={cn("h-px bg-gradient-to-r from-transparent to-current opacity-60", width)} />
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 2l3.2 6.8L22 12l-6.8 3.2L12 22l-3.2-6.8L2 12l6.8-3.2Z" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </svg>
      <span className={cn("h-px bg-gradient-to-l from-transparent to-current opacity-60", width)} />
    </div>
  );
}
