import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type VedicSymbolKind =
  | "om"
  | "lotus"
  | "lotus-coins"
  | "trident"
  | "sun"
  | "career-sun"
  | "moon"
  | "moon-lotus"
  | "chakra"
  | "diya"
  | "sacred-flame"
  | "navagraha"
  | "mantra"
  | "daily-practice"
  | "scales-shield"
  | "sacred-book"
  | "heart-knot"
  | "rings"
  | "home-heart"
  | "healing-leaf"
  | "growth"
  | "gemstone"
  | "muhurta"
  | "charity"
  | "meditation"
  | "consultation"
  | "birth-chart"
  | "chat"
  | "spark";

export type VedicSymbolDef = {
  viewBox: string;
  path: string;
  label: string;
  ariaLabel?: string;
};

export const vedicSymbols: Record<string, VedicSymbolDef> = {
  om: {
    viewBox: "0 0 100 100",
    path: "M50 10 C35 10 25 20 25 35 C25 45 30 50 35 55 L35 75 C35 82 40 85 50 85 C60 85 65 82 65 75 L65 55 C70 50 75 45 75 35 C75 20 65 10 50 10 Z M35 30 C35 22 42 18 50 18 C58 18 65 22 65 30 C65 38 58 42 50 42 C42 42 35 38 35 30 Z",
    label: "Om",
    ariaLabel: "Sacred Om symbol",
  },
  sun: {
    viewBox: "0 0 100 100",
    path: "M50 15 C55 15 60 20 60 25 C60 30 55 35 50 35 C45 35 40 30 40 25 C40 20 45 15 50 15 Z M50 45 C65 45 78 55 82 70 C70 72 62 68 58 62 C68 58 76 52 80 45 C68 43 58 48 50 45 Z M50 80 C40 80 30 72 28 60 C35 58 42 62 46 68 C38 66 30 60 26 50 C36 48 46 55 50 55 C54 55 64 48 74 50 C70 60 62 66 54 68 C58 62 65 58 72 60 C70 72 60 80 50 80 Z",
    label: "Surya",
    ariaLabel: "Sun deity",
  },
  moon: {
    viewBox: "0 0 100 100",
    path: "M50 20 C65 20 78 32 78 50 C78 68 65 80 50 80 C40 80 32 75 28 68 C68 65 72 35 50 20 Z",
    label: "Chandra",
    ariaLabel: "Moon deity",
  },
};

// ── Helper mappings ───────────────────────────────────────────────

const HOMAM_IMAGES: Record<string, string> = {
  "ganapathi-homam":               "/images/homams/ganapathi-homam.jpg",
  "navagraha-homam":               "/images/homams/navagraha-homam.jpg",
  "lakshmi-kubera-homam":          "/images/homams/lakshmi-kubera-homam.jpg",
  "surya-homam":                   "/images/homams/surya-homam.jpg",
  "chandra-homam":                 "/images/homams/chandra-homam.jpg",
  "rudra-homam":                   "/images/homams/rudra-homam.jpg",
  "maha-mrityunjaya-homam":        "/images/homams/maha-mrityunjaya-homam.jpg",
  "saraswati-homam":               "/images/homams/saraswati-homam.jpg",
  "durga-homam":                   "/images/homams/durga-homam.jpg",
  "sudarshana-homam":              "/images/homams/sudarshana-homam.jpg",
  "dhanvantari-homam":             "/images/homams/dhanvantari-homam.jpg",
  "ayushya-homam":                 "/images/homams/ayushya-homam.jpg",
  "shani-shanti-homam":            "/images/homams/shani-shanti-homam.jpg",
  "rahu-ketu-shanti-homam":        "/images/homams/rahu-ketu-shanti-homam.jpg",
  "mangal-dosha-homam":            "/images/homams/mangal-dosha-homam.jpg",
  "kadali-vivaha":                 "/images/homams/kadali-vivaha.jpg",
  "kumbha-vivaha":                 "/images/homams/kumbha-vivaha.jpg",
  "moksha-narayana-bali-tila-homa":"/images/homams/moksha-narayana-bali-tila-homa.jpg",
};

const HOMAM_SYMBOLS: Record<string, VedicSymbolKind> = {
  "ganapathi-homam": "lotus",
  "navagraha-homam": "navagraha",
  "lakshmi-kubera-homam": "chakra",
  "surya-homam": "sun",
  "chandra-homam": "moon",
  "rudra-homam": "trident",
  "maha-mrityunjaya-homam": "chakra",
  "saraswati-homam": "sacred-book",
  "durga-homam": "chakra",
  "sudarshana-homam": "chakra",
  "dhanvantari-homam": "healing-leaf",
  "ayushya-homam": "healing-leaf",
  "shani-shanti-homam": "chakra",
  "rahu-ketu-shanti-homam": "navagraha",
  "mangal-dosha-homam": "chakra",
  "kadali-vivaha": "rings",
  "kumbha-vivaha": "rings",
  "moksha-narayana-bali-tila-homa": "diya",
};

const SERVICE_SYMBOLS: Record<string, VedicSymbolKind> = {
  "love-relationship-problems": "heart-knot",
  "marriage-delay-divorce-issues": "rings",
  "career-confusion-job-problems": "career-sun",
  "financial-instability-debt-problems": "growth",
  "family-conflicts-domestic-issues": "home-heart",
  "mental-stress-anxiety-depression": "meditation",
  "health-wellness-astrology": "healing-leaf",
  "education-exam-success": "sacred-book",
  "business-growth-partnership-problems": "growth",
  "property-legal-court-case-guidance": "scales-shield",
};

const REMEDY_SYMBOLS: Record<string, VedicSymbolKind> = {
  "Puja": "diya",
  "Homam": "sacred-flame",
  "Mantra": "mantra",
  "Gemstone": "gemstone",
  "Donation": "charity",
  "Fasting": "meditation",
  "Japa": "mantra",
  "Visiting temples": "diya",
  "Chanting": "mantra",
  "Charity": "charity",
};

export function getHomamImage(slug: string): string | undefined {
  return HOMAM_IMAGES[slug];
}

export function getHomamSymbol(slug: string): VedicSymbolKind {
  return HOMAM_SYMBOLS[slug] ?? "sacred-flame";
}

export function getServiceSymbol(slug: string): VedicSymbolKind {
  return SERVICE_SYMBOLS[slug] ?? "chakra";
}

export function getRemedySymbol(label: string): VedicSymbolKind {
  for (const [key, value] of Object.entries(REMEDY_SYMBOLS)) {
    if (label.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return "diya";
}

export function VedicSymbol({
  name,
  className,
  ...props
}: {
  name: string;
  className?: string;
  [key: string]: unknown;
}) {
  const symbol = vedicSymbols[name];
  if (!symbol) return null;
  return (
    <svg
      viewBox={symbol.viewBox}
      className={cn("h-5 w-5", className)}
      aria-label={symbol.ariaLabel || symbol.label}
      role="img"
      {...props}
    >
      <path d={symbol.path} fill="currentColor" />
    </svg>
  );
}
