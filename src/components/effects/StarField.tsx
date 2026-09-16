import { cn } from "@/lib/utils";

/** Deterministic pseudo-random so SSR and client markup match (no hydration drift). */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Star = { top: number; left: number; size: number; delay: number; dur: number };

function makeStars(count: number, seed: number): Star[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    top: rand() * 100,
    left: rand() * 100,
    size: 1 + rand() * 2.2,
    delay: rand() * 5,
    dur: 3 + rand() * 4,
  }));
}

export function StarField({
  count = 60,
  seed = 7,
  className,
}: {
  count?: number;
  seed?: number;
  className?: string;
}) {
  const stars = makeStars(count, seed);
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden opacity-70",
        className
      )}
    >
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full animate-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
            backgroundColor: "#dda23f",
            boxShadow: "0 0 5px rgba(214, 150, 46, 0.5)",
          }}
        />
      ))}
    </div>
  );
}
