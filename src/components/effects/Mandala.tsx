import { cn } from "@/lib/utils";

/** Decorative Vedic mandala (line-art). Colour via currentColor. */
export function Mandala({ className }: { className?: string }) {
  const ticks = Array.from({ length: 48 });
  const petals = Array.from({ length: 12 });
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn(className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.5"
      aria-hidden
    >
      <circle cx="100" cy="100" r="97" />
      <circle cx="100" cy="100" r="80" strokeWidth="0.7" />
      <circle cx="100" cy="100" r="58" strokeDasharray="1 3" />
      <circle cx="100" cy="100" r="40" />
      <circle cx="100" cy="100" r="15" />
      {ticks.map((_, i) => {
        const a = (i / ticks.length) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={(100 + Math.cos(a) * 80).toFixed(2)}
            y1={(100 + Math.sin(a) * 80).toFixed(2)}
            x2={(100 + Math.cos(a) * 97).toFixed(2)}
            y2={(100 + Math.sin(a) * 97).toFixed(2)}
          />
        );
      })}
      {petals.map((_, i) => {
        const a = (i / petals.length) * Math.PI * 2;
        return (
          <circle
            key={`p${i}`}
            cx={(100 + Math.cos(a) * 49).toFixed(2)}
            cy={(100 + Math.sin(a) * 49).toFixed(2)}
            r="7"
            strokeWidth="0.6"
          />
        );
      })}
    </svg>
  );
}
