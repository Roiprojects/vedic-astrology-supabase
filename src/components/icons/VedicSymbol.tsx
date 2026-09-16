import type { ReactNode } from "react";
import type { VedicSymbolKind } from "@/lib/presentation/vedic-symbols";
import { cn } from "@/lib/utils";

/**
 * Hand-drawn Vedic line-symbols (gold-on-anything). Each is a distinct, ornate
 * glyph rendered on a 24×24 grid — far richer than a generic icon set. Stroke
 * uses `currentColor`, so colour comes from the parent (e.g. text-gold-light).
 */

const sizes = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-11 w-11",
  xl: "h-16 w-16",
};

// Reusable bits
const dot = (cx: number, cy: number, r = 1) => (
  <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />
);
const ray = (angle: number, r1: number, r2: number) => {
  const a = (angle * Math.PI) / 180;
  return (
    <line
      x1={(12 + Math.cos(a) * r1).toFixed(2)}
      y1={(12 + Math.sin(a) * r1).toFixed(2)}
      x2={(12 + Math.cos(a) * r2).toFixed(2)}
      y2={(12 + Math.sin(a) * r2).toFixed(2)}
    />
  );
};

const paths: Record<VedicSymbolKind, ReactNode> = {
  // ॐ — kept as authentic Devanagari, drawn large
  om: (
    <text
      x="12"
      y="12"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="21"
      fill="currentColor"
      stroke="none"
      style={{ fontFamily: "var(--font-serif), serif" }}
    >
      ॐ
    </text>
  ),
  // 8-petal lotus
  lotus: (
    <>
      <path d="M12 21c-4-1-7-4-7-7 3-1 5 1 7 4 2-3 4-5 7-4 0 3-3 6-7 7Z" />
      <path d="M12 18c-2-3-2-6 0-9 2 3 2 6 0 9Z" />
      <path d="M12 18c-3-2-4-5-4-8 3 1 5 4 4 8Z" />
      <path d="M12 18c3-2 4-5 4-8-3 1-5 4-4 8Z" />
    </>
  ),
  "lotus-coins": (
    <>
      <path d="M12 15c-3-1-5-3-5-6 2-1 4 0 5 3 1-3 3-4 5-3 0 3-2 5-5 6Z" />
      <circle cx="8.5" cy="18" r="2.4" />
      <circle cx="14" cy="18.5" r="2.8" />
    </>
  ),
  // Trishula (trident)
  trident: (
    <>
      <path d="M12 22V9" />
      <path d="M12 9V3" />
      <path d="M7 10V6c0-1 .3-2 1-3M17 10V6c0-1-.3-2-1-3" />
      <path d="M7 10c0 1.5 2 2 5 2s5-.5 5-2" />
      <circle cx="12" cy="19.5" r="1.4" />
    </>
  ),
  // Surya — sun with rays
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <g key={a}>{ray(a, 6, 8.5)}</g>
      ))}
    </>
  ),
  "career-sun": (
    <>
      <path d="M4 16h16" />
      <path d="M7.5 16a4.5 4.5 0 0 1 9 0" />
      {[210, 240, 270, 300, 330].map((a) => (
        <g key={a}>{ray(a, 5, 7)}</g>
      ))}
    </>
  ),
  // Chandra — crescent moon
  moon: <path d="M17 4a8 8 0 1 0 0 16 6.5 6.5 0 0 1 0-16Z" />,
  "moon-lotus": (
    <>
      <path d="M17 3a7 7 0 1 0 0 12 5.5 5.5 0 0 1 0-12Z" />
      <path d="M12 21c-3-1-5-3-5-5 2-1 4 0 5 2 1-2 3-3 5-2 0 2-2 4-5 5Z" />
    </>
  ),
  // Dharma / Sudarshana chakra
  chakra: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.4" />
      {[0, 45, 90, 135].map((a) => (
        <g key={a}>{ray(a, 2.4, 8)}</g>
      ))}
      {[22, 67, 112, 157].map((a) => (
        <g key={a}>{ray(a, 2.4, 8)}</g>
      ))}
    </>
  ),
  // Diya — oil lamp with flame
  diya: (
    <>
      <path d="M12 6c1.4 1.7 2 3 2 4a2 2 0 1 1-4 0c0-1 .6-2.3 2-4Z" />
      <path d="M4 15c1.4 2.4 4.4 4 8 4s6.6-1.6 8-4c-2-1-5-1.6-8-1.6S6 14 4 15Z" />
    </>
  ),
  // Sacred flame (homam fire)
  "sacred-flame": (
    <>
      <path d="M12 2c3 3.5 4.5 6.3 4.5 8.5a4.5 4.5 0 1 1-9 0C7.5 8.3 9 5.5 12 2Z" />
      <path d="M12 9c1.4 1.6 2 2.9 2 4a2 2 0 1 1-4 0c0-1.1.6-2.4 2-4Z" />
    </>
  ),
  // Navagraha — nine planets (3×3)
  navagraha: (
    <>
      <circle cx="12" cy="12" r="9" opacity="0.55" />
      {[7, 12, 17].flatMap((y) => [7, 12, 17].map((x) => <g key={`${x}-${y}`}>{dot(x, y, 1.15)}</g>))}
    </>
  ),
  // Japa mala — prayer beads
  mantra: (
    <>
      <circle cx="12" cy="12.5" r="6.5" />
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a) => {
        const r = (a * Math.PI) / 180;
        return <g key={a}>{dot(12 + Math.cos(r) * 6.5, 12.5 + Math.sin(r) * 6.5, 1.1)}</g>;
      })}
      <path d="M12 6V3" />
      {dot(12, 2.2, 1.3)}
    </>
  ),
  "daily-practice": (
    <>
      <circle cx="12" cy="12.5" r="6" />
      {[20, 70, 120, 170, 220, 270, 320].map((a) => {
        const r = (a * Math.PI) / 180;
        return <g key={a}>{dot(12 + Math.cos(r) * 6, 12.5 + Math.sin(r) * 6, 1)}</g>;
      })}
    </>
  ),
  // Balance scales — legal / justice
  "scales-shield": (
    <>
      <path d="M12 4v15" />
      <path d="M8 20h8" />
      <path d="M5 8h14" />
      <path d="M5 8l-2 4a3 1.4 0 0 0 4 0Z" />
      <path d="M19 8l2 4a3 1.4 0 0 1-4 0Z" />
      {dot(12, 4, 1.2)}
    </>
  ),
  // Open manuscript / book — education, Saraswati
  "sacred-book": (
    <>
      <path d="M12 6v13" />
      <path d="M12 6C10 4.6 6.5 4.5 4 5v13c2.5-.5 6-.4 8 1 2-1.4 5.5-1.5 8-1V5c-2.5-.5-6-.4-8 1Z" />
      <path d="M6.5 9h3M6.5 12h3M14.5 9h3M14.5 12h3" opacity="0.7" />
    </>
  ),
  // Heart knot — love & relationships
  "heart-knot": (
    <>
      <path d="M12 20C7 16 4 13 4 9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 8 2.5C20 13 17 16 12 20Z" />
      <path d="M9.5 10.5l5 3M14.5 10.5l-5 3" opacity="0.6" />
    </>
  ),
  // Two rings — marriage
  rings: (
    <>
      <circle cx="9.5" cy="13" r="4.5" />
      <circle cx="14.5" cy="13" r="4.5" />
      <path d="M8 7l1.5 2M16 7l-1.5 2" />
    </>
  ),
  // House + heart — family
  "home-heart": (
    <>
      <path d="M4 11l8-6 8 6" />
      <path d="M6 10v9h12v-9" />
      <path d="M12 17c-2-1.4-3-2.6-3-3.8A1.5 1.5 0 0 1 12 12a1.5 1.5 0 0 1 3 1.2c0 1.2-1 2.4-3 3.8Z" />
    </>
  ),
  // Healing leaf — health
  "healing-leaf": (
    <>
      <path d="M6 18C6 11 10 6 18 5c1 8-4 12-11 13Z" />
      <path d="M9 15c2-3 4-5 7-6" opacity="0.7" />
    </>
  ),
  // Sprout — growth / business
  growth: (
    <>
      <path d="M12 21v-9" />
      <path d="M12 14c-1-3-3.5-4-6-4 0 3 2.5 4.5 6 4Z" />
      <path d="M12 12c1-3.5 3.5-5 6.5-5 0 3.5-2.8 5.5-6.5 5Z" />
    </>
  ),
  // Gemstone
  gemstone: (
    <>
      <path d="M8 4h8l4 5-8 11L4 9Z" />
      <path d="M4 9h16M8 4l4 5 4-5M9 9l3 11 3-11" opacity="0.7" />
    </>
  ),
  // Auspicious timing — crescent + star
  muhurta: (
    <>
      <path d="M16 4a7 7 0 1 0 0 14 5.5 5.5 0 0 1 0-14Z" />
      <path d="M18.5 4.5l.7 1.8 1.8.3-1.4 1.3.4 1.9-1.5-1-1.5 1 .4-1.9-1.4-1.3 1.8-.3Z" />
    </>
  ),
  // Giving hand — charity
  charity: (
    <>
      <path d="M4 14c2-1.5 4-2 6-1.5l3 1c1 .4 1 1.6 0 2l-4 .3" />
      <path d="M4 14v5h4l6-.5c2-.2 4-1.3 6-3.2-.6-1-1.7-1.2-2.7-.6L13 17" />
      <path d="M12 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    </>
  ),
  // Meditation — seated figure
  meditation: (
    <>
      <circle cx="12" cy="6" r="2.5" />
      <path d="M12 9c-2 0-3.5 1.5-3.5 4 0 1 .5 2 1.5 2.5" />
      <path d="M12 9c2 0 3.5 1.5 3.5 4 0 1-.5 2-1.5 2.5" />
      <path d="M5 19c1.5-1.5 4-2 7-2s5.5.5 7 2c-1.5 1.3-4 1.8-7 1.8s-5.5-.5-7-1.8Z" />
    </>
  ),
  // Scroll — consultation / analysis
  consultation: (
    <>
      <path d="M7 4h9a2 2 0 0 1 2 2v11a2 2 0 0 0 2 2H9a2 2 0 0 1-2-2Z" />
      <path d="M7 4a2 2 0 0 0-2 2v1h2" />
      <path d="M10 9h5M10 12h5M10 15h3" opacity="0.75" />
    </>
  ),
  // North-Indian kundli — square + inner diamond
  "birth-chart": (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="0.5" />
      <path d="M12 3.5L20.5 12 12 20.5 3.5 12Z" />
    </>
  ),
  // Chat bubble + spark
  chat: (
    <>
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3v-3a2 2 0 0 1-1-2Z" />
      <path d="M13 8l.9 2.1 2.1.9-2.1.9L13 14l-.9-2.1-2.1-.9 2.1-.9Z" />
    </>
  ),
  "consultation-chat": (
    <>
      <path d="M5 5.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-5l-4 3v-3H7a2 2 0 0 1-2-2Z" />
      <path d="M9 8h6M9 11h4" opacity="0.75" />
      <path d="M15.5 15.5l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7Z" />
    </>
  ),
  // 4-point sparkle (brand)
  spark: (
    <path d="M12 2c.6 4.4 2.9 6.9 7.5 8-4.6 1.1-6.9 3.6-7.5 8-.6-4.4-2.9-6.9-7.5-8C9.1 8.9 11.4 6.4 12 2Z" />
  ),
};

export function VedicSymbol({
  kind,
  size = "md",
  decorative = true,
  className,
  label,
  strokeWidth = 1.5,
}: {
  kind: VedicSymbolKind;
  size?: keyof typeof sizes;
  decorative?: boolean;
  className?: string;
  label?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(sizes[size], className)}
      aria-hidden={decorative || undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : (label ?? kind.replace(/-/g, " "))}
    >
      {paths[kind] ?? paths.spark}
    </svg>
  );
}
