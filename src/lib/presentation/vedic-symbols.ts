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
  | "spark"
  | "consultation-chat";

export const symbolLabels: Record<VedicSymbolKind, string> = {
  om: "Om",
  lotus: "Lotus",
  "lotus-coins": "Lotus Coins",
  trident: "Trident",
  sun: "Sun",
  "career-sun": "Career Sun",
  moon: "Moon",
  "moon-lotus": "Moon Lotus",
  chakra: "Chakra",
  diya: "Diya",
  "sacred-flame": "Sacred Flame",
  navagraha: "Navagraha",
  mantra: "Mantra",
  "daily-practice": "Daily Practice",
  "scales-shield": "Scales Shield",
  "sacred-book": "Sacred Book",
  "heart-knot": "Heart Knot",
  rings: "Rings",
  "home-heart": "Home Heart",
  "healing-leaf": "Healing Leaf",
  growth: "Growth",
  gemstone: "Gemstone",
  muhurta: "Muhurta",
  charity: "Charity",
  meditation: "Meditation",
  consultation: "Consultation",
  "birth-chart": "Birth Chart",
  chat: "Chat",
  spark: "Spark",
  "consultation-chat": "Consultation Chat",
};

const homamSlugToSymbol: Record<string, VedicSymbolKind> = {
  "ganapathi-homam": "om",
  "navagraha-homam": "navagraha",
  "lakshmi-kubera-homam": "lotus-coins",
  "surya-homam": "sun",
  "chandra-homam": "moon",
  "rudra-homam": "trident",
  "maha-mrityunjaya-homam": "scales-shield",
  "saraswati-homam": "sacred-book",
  "durga-homam": "scales-shield",
  "sudarshana-homam": "chakra",
  "dhanvantari-homam": "healing-leaf",
  "ayushya-homam": "growth",
  "shani-shanti-homam": "spark",
  "rahu-ketu-shanti-homam": "spark",
  "mangal-dosha-homam": "scales-shield",
  "kadali-vivaha": "lotus",
  "kumbha-vivaha": "lotus",
  "moksha-narayana-bali-tila-homa": "diya",
};

const serviceSlugToSymbol: Record<string, VedicSymbolKind> = {
  "love-relationship-problems": "heart-knot",
  "marriage-delay-divorce-issues": "rings",
  "career-confusion-job-problems": "career-sun",
  "financial-instability-debt-problems": "lotus-coins",
  "family-conflicts-domestic-issues": "home-heart",
  "mental-stress-anxiety-depression": "meditation",
  "health-wellness-astrology": "healing-leaf",
  "education-exam-success": "sacred-book",
  "business-growth-partnership-problems": "growth",
  "property-legal-court-case-guidance": "scales-shield",
};


const homamSlugToImage: Record<string, string> = {
  "ganapathi-homam": "/images/homams/ganapathi-homam.jpg",
  "navagraha-homam": "/images/homams/navagraha-homam.jpg",
  "lakshmi-kubera-homam": "/images/homams/lakshmi-kubera-homam.jpg",
  "surya-homam": "/images/homams/surya-homam.jpg",
  "chandra-homam": "/images/homams/chandra-homam.jpg",
  "rudra-homam": "/images/homams/rudra-homam.jpg",
  "maha-mrityunjaya-homam": "/images/homams/maha-mrityunjaya-homam.jpg",
  "saraswati-homam": "/images/homams/saraswati-homam.jpg",
  "durga-homam": "/images/homams/durga-homam.jpg",
  "sudarshana-homam": "/images/homams/sudarshana-homam.jpg",
  "dhanvantari-homam": "/images/homams/dhanvantari-homam.jpg",
  "ayushya-homam": "/images/homams/ayushya-homam.jpg",
  "shani-shanti-homam": "/images/homams/shani-shanti-homam.jpg",
  "rahu-ketu-shanti-homam": "/images/homams/rahu-ketu-shanti-homam.jpg",
  "mangal-dosha-homam": "/images/homams/mangal-dosha-homam.jpg",
  "kadali-vivaha": "/images/homams/kadali-vivaha.jpg",
  "kumbha-vivaha": "/images/homams/kumbha-vivaha.jpg",
  "moksha-narayana-bali-tila-homa": "/images/homams/moksha-narayana-bali-tila-homa.jpg",
};

export function getHomamSymbol(slug: string): VedicSymbolKind {
  return homamSlugToSymbol[slug] ?? "sacred-flame";
}

export function getHomamImage(slug: string): string | undefined {
  return homamSlugToImage[slug];
}

export function getServiceSymbol(slug: string): VedicSymbolKind {
  return serviceSlugToSymbol[slug] ?? "spark";
}

export function getRemedySymbol(text: string): VedicSymbolKind {
  const value = text.toLowerCase();
  if (/mantra|chant|japa|prayer/.test(value)) return "mantra";
  if (/gem|stone|pearl|coral|emerald|sapphire/.test(value)) return "gemstone";
  if (/homam|homa|pooja|puja|ritual|offering/.test(value)) return "sacred-flame";
  if (/muhurat|muhurta|auspicious|timing/.test(value)) return "muhurta";
  if (/donat|charity|feed|help the needy/.test(value)) return "charity";
  if (/meditat|breath|grounding|yoga/.test(value)) return "meditation";
  if (/daily|at home|lifestyle|vrat|fasting/.test(value)) return "daily-practice";
  return "spark";
}
