import { calculatePanchanga, NAKSHATRAS } from "@/lib/panchanga";

export const RASHIS = [
  "Mesha (Aries)",
  "Vrishabha (Taurus)",
  "Mithuna (Gemini)",
  "Karka (Cancer)",
  "Simha (Leo)",
  "Kanya (Virgo)",
  "Tula (Libra)",
  "Vrischika (Scorpio)",
  "Dhanu (Sagittarius)",
  "Makara (Capricorn)",
  "Kumbha (Aquarius)",
  "Meena (Pisces)",
] as const;

export type Rashi = (typeof RASHIS)[number];

export type BirthDetails = {
  name: string;
  dob: string;
  tob: string;
  pob: string;
  gender: string;
  language: string;
  intention?: string;
};

export type CosmicChart = {
  sunSign: Rashi;
  moonSign: Rashi;
  ascendant: Rashi;
  nakshatra: string;
  rashiLord: string;
  lagnaLord: string;
  dailyEnergy: number;
  guidance: string;
};

const LORDS = [
  "Mars",
  "Venus",
  "Mercury",
  "Moon",
  "Sun",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Saturn",
  "Jupiter",
];

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function rashiFromDeg(deg: number): Rashi {
  const idx = Math.floor((((deg % 360) + 360) % 360) / 30) % 12;
  return RASHIS[idx];
}

function tropicalSunLongitude(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = (date.getTime() - start) / 86400000;
  return (279.5 + 0.985647 * day) % 360;
}

export function computeCosmicChart(details: BirthDetails): CosmicChart {
  const dob = details.dob ? new Date(`${details.dob}T${details.tob || "12:00"}`) : new Date();
  const valid = Number.isNaN(dob.getTime()) ? new Date() : dob;
  const sunDeg = tropicalSunLongitude(valid);
  const seed = hashString(`${details.name}|${details.dob}|${details.tob}|${details.pob}`);
  const moonDeg = (sunDeg + (seed % 360)) % 360;
  const [hh = "12", mm = "00"] = (details.tob || "12:00").split(":");
  const hours = Number(hh) + Number(mm) / 60;
  const ascDeg = (sunDeg + hours * 15 + (seed % 27)) % 360;
  const panchanga = calculatePanchanga(valid);
  const nakshatra = NAKSHATRAS[seed % NAKSHATRAS.length] || panchanga.nakshatra;
  const sunSign = rashiFromDeg(sunDeg - 24.13);
  const moonSign = rashiFromDeg(moonDeg - 24.13);
  const ascendant = rashiFromDeg(ascDeg);
  const dailyEnergy = 42 + (seed % 51);
  const guidancePool = [
    "Steady the mind before important conversations. The Moon favours sincere speech today.",
    "A measured pause before financial decisions will protect your long-term prosperity.",
    "Offer water to the Sun at dawn and keep commitments small but complete.",
    "Family harmony improves when you listen first. Venus asks for gentleness.",
    "Career doors open through discipline, not haste. Saturn rewards consistency.",
    "Protect your energy after sunset. A simple mantra will settle restless thoughts.",
  ];

  return {
    sunSign,
    moonSign,
    ascendant,
    nakshatra,
    rashiLord: LORDS[RASHIS.indexOf(sunSign)] ?? "Sun",
    lagnaLord: LORDS[RASHIS.indexOf(ascendant)] ?? "Mars",
    dailyEnergy,
    guidance: guidancePool[seed % guidancePool.length],
  };
}

export function greetingForNow(name?: string): string {
  const hour = new Date().getHours();
  const first = name?.trim().split(/\s+/)[0];
  const who = first ? `, ${first}` : "";
  if (hour < 12) return `Good morning${who}`;
  if (hour < 17) return `Good afternoon${who}`;
  return `Good evening${who}`;
}

export function formatDisplayDate(date = new Date()): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export const MOON_PHASES = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent",
] as const;

export function moonPhaseName(date = new Date()): (typeof MOON_PHASES)[number] {
  const synodic = 29.53058867;
  const known = Date.UTC(2000, 0, 6, 18, 14);
  const days = (date.getTime() - known) / 86400000;
  const idx = Math.floor((((days % synodic) + synodic) % synodic) / (synodic / 8)) % 8;
  return MOON_PHASES[idx];
}
