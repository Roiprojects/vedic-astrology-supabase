import { cn } from "@/lib/utils";

/**
 * Rotating divine "power circle" — a sunburst of golden rays plus concentric
 * rings and a soft core glow. Designed to sit BEHIND a deity image so the rays
 * radiate outward around its edges (like a god's aura / prabhachakra).
 *
 * Position + size via `className` (e.g. `left-1/2 top-[30%] w-[150%]`); the
 * element self-centres on that point.
 */
export function PowerCircle({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute aspect-square -translate-x-1/2 -translate-y-1/2",
        className
      )}
    >
      {/* Warm bloom filling the circle */}
      <div className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle,rgba(255,201,92,0.55),rgba(255,170,60,0.2)_48%,transparent_72%)] blur-xl animate-glow" />
      {/* Radiating rays — slowly rotating */}
      <div className="absolute inset-0 animate-spin-slow rounded-full [background:repeating-conic-gradient(from_0deg,rgba(255,222,140,0.85)_0_1.2deg,transparent_1.2deg_7deg)] [mask-image:radial-gradient(circle,black_0_22%,rgba(0,0,0,0.7)_46%,transparent_80%)]" />
      {/* Counter-set of finer rays for a denser sunburst */}
      <div className="absolute inset-0 animate-spin-slow rounded-full [background:repeating-conic-gradient(from_3.5deg,rgba(255,240,190,0.5)_0_0.6deg,transparent_0.6deg_7deg)] [mask-image:radial-gradient(circle,transparent_0_30%,black_50%,transparent_82%)]" />
      {/* Bright glowing ring */}
      <div className="absolute inset-[24%] rounded-full border-2 border-[#ffe6a8]/60 shadow-[0_0_24px_4px_rgba(255,214,120,0.35)]" />
    </div>
  );
}
