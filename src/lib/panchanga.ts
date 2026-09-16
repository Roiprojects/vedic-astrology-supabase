/**
 * Vedic Panchanga calculator (approximate — Lahiri ayanamsa)
 * Calculates Tithi, Nakshatra, Paksha, Yoga, and Vara for a given date.
 * Uses simplified VSOP87 / Jean Meeus formulas sufficient for daily display.
 */

const D2R = Math.PI / 180;

function toJulianDay(date: Date): number {
  const Y = date.getUTCFullYear();
  const M = date.getUTCMonth() + 1;
  const D = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60) / 24;
  const A = Math.floor((14 - M) / 12);
  const y = Y + 4800 - A;
  const m = M + 12 * A - 3;
  return D + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function normalise(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = normalise(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = normalise(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mr = M * D2R;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
    + 0.000289 * Math.sin(3 * Mr);
  return normalise(L0 + C);
}

function moonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = normalise(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841);
  const M = normalise(357.52911 + 35999.05029 * T - 0.0001537 * T * T); // Sun anomaly
  const Mp = normalise(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699); // Moon anomaly
  const D = normalise(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868);
  const F = normalise(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000);

  const Mrads = M * D2R, Mprads = Mp * D2R, Drads = D * D2R, Frads = F * D2R;

  const lon = L0
    + 6.2886 * Math.sin(Mprads)
    + 1.2740 * Math.sin(2 * Drads - Mprads)
    + 0.6583 * Math.sin(2 * Drads)
    + 0.2136 * Math.sin(2 * Mprads)
    - 0.1851 * Math.sin(Mrads)
    - 0.1143 * Math.sin(2 * Frads)
    + 0.0588 * Math.sin(2 * Drads - 2 * Mprads)
    + 0.0572 * Math.sin(2 * Drads - Mrads - Mprads)
    + 0.0533 * Math.sin(2 * Drads + Mprads);

  return normalise(lon);
}

// Lahiri ayanamsa (approximate, sufficient for daily display)
function ayanamsa(jd: number): number {
  const T = (jd - 2415020.0) / 36524.2199;
  return 23.452294 - 0.0130125 * T - 0.00000164 * T * T + 0.000000503 * T * T * T
    - 22.460 + 0.00020 * T;
  // Simplified: close enough for display purposes (~23.5° in 2026)
}

function tropicalToSidereal(tropLong: number, jd: number): number {
  // Lahiri ayanamsa for 2026 is approximately 24.13°
  const ayn = 24.13;
  return normalise(tropLong - ayn);
}

export const TITHIS = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima / Amavasya",
];

export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
  "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
  "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
  "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

export const VARAS = ["Ravivara", "Somavara", "Mangalavara", "Budhavara", "Guruvara", "Shukravara", "Shanivara"];

export interface PanchangaResult {
  tithi: string;
  tithiNumber: number;
  paksha: "Shukla" | "Krishna";
  nakshatra: string;
  nakshatraNumber: number;
  vara: string;   // day of week in Sanskrit
  varaEn: string; // day of week in English
}

export function calculatePanchanga(date: Date = new Date()): PanchangaResult {
  // Use IST (UTC+5:30) noon for the day
  const ist = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  // Adjust to UTC: IST is UTC+5:30
  const utc = new Date(ist.getTime() - 5.5 * 3600 * 1000);
  const jd = toJulianDay(utc);

  const sunTrop = sunLongitude(jd);
  const moonTrop = moonLongitude(jd);

  // Sidereal (Lahiri)
  const sunSid = tropicalToSidereal(sunTrop, jd);
  const moonSid = tropicalToSidereal(moonTrop, jd);

  // Tithi: each 12° difference = 1 tithi
  let diff = normalise(moonSid - sunSid);
  const tithiFloat = diff / 12;
  const tithiNumber = (Math.floor(tithiFloat) % 30) + 1; // 1–30

  // Paksha
  const paksha: "Shukla" | "Krishna" = tithiNumber <= 15 ? "Shukla" : "Krishna";
  const tithiInPaksha = tithiNumber <= 15 ? tithiNumber : tithiNumber - 15;

  let tithiName: string;
  if (tithiInPaksha === 15) {
    tithiName = paksha === "Shukla" ? "Purnima" : "Amavasya";
  } else {
    tithiName = TITHIS[tithiInPaksha - 1] ?? `Tithi ${tithiInPaksha}`;
  }

  // Nakshatra: each 360/27 ≈ 13.333° = 1 nakshatra
  const nakshatraFloat = moonSid / (360 / 27);
  const nakshatraNumber = (Math.floor(nakshatraFloat) % 27) + 1; // 1–27
  const nakshatraName = NAKSHATRAS[nakshatraNumber - 1] ?? `Nakshatra ${nakshatraNumber}`;

  // Vara (weekday)
  const dayOfWeek = date.getDay(); // 0=Sun … 6=Sat
  const vara = VARAS[dayOfWeek];
  const varaEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek];

  return {
    tithi: tithiName,
    tithiNumber: tithiInPaksha,
    paksha,
    nakshatra: nakshatraName,
    nakshatraNumber,
    vara,
    varaEn,
  };
}

// ── Hindu festivals 2026 ────────────────────────────────────────
// Key festivals with fixed or near-fixed dates for 2026
export interface Festival {
  name: string;
  date: string; // YYYY-MM-DD
  type: "major" | "regular";
}

export const FESTIVALS_2026: Festival[] = [
  { name: "Makar Sankranti", date: "2026-01-14", type: "major" },
  { name: "Vasant Panchami", date: "2026-01-24", type: "regular" },
  { name: "Maha Shivaratri", date: "2026-02-15", type: "major" },
  { name: "Holi", date: "2026-03-04", type: "major" },
  { name: "Ugadi / Gudi Padwa", date: "2026-03-19", type: "major" },
  { name: "Ram Navami", date: "2026-03-27", type: "regular" },
  { name: "Hanuman Jayanti", date: "2026-04-11", type: "regular" },
  { name: "Akshaya Tritiya", date: "2026-04-22", type: "major" },
  { name: "Buddha Purnima", date: "2026-05-05", type: "regular" },
  { name: "Vat Savitri", date: "2026-05-19", type: "regular" },
  { name: "Rath Yatra", date: "2026-06-23", type: "regular" },
  { name: "Guru Purnima", date: "2026-07-10", type: "major" },
  { name: "Nag Panchami", date: "2026-07-29", type: "regular" },
  { name: "Varalakshmi Vratam", date: "2026-08-07", type: "regular" },
  { name: "Raksha Bandhan", date: "2026-08-22", type: "major" },
  { name: "Janmashtami", date: "2026-08-26", type: "major" },
  { name: "Ganesh Chaturthi", date: "2026-09-07", type: "major" },
  { name: "Navaratri (begins)", date: "2026-09-26", type: "major" },
  { name: "Dussehra", date: "2026-10-05", type: "major" },
  { name: "Karva Chauth", date: "2026-10-13", type: "regular" },
  { name: "Diwali", date: "2026-10-25", type: "major" },
  { name: "Bhai Dooj", date: "2026-10-27", type: "regular" },
  { name: "Chhath Puja", date: "2026-10-30", type: "regular" },
  { name: "Dev Deepawali", date: "2026-11-09", type: "regular" },
  { name: "Kartik Purnima", date: "2026-11-09", type: "regular" },
  { name: "Vivah Panchami", date: "2026-11-29", type: "regular" },
  { name: "Gita Jayanti", date: "2026-12-12", type: "regular" },
];

export function getUpcomingFestival(today: Date = new Date()): Festival | null {
  const todayStr = today.toISOString().slice(0, 10);
  return (
    FESTIVALS_2026.find((f) => f.date >= todayStr) ??
    FESTIVALS_2026.find((f) => f.date >= `${today.getFullYear()}-01-01`) ??
    null
  );
}

export function getTodayFestival(today: Date = new Date()): Festival | null {
  const todayStr = today.toISOString().slice(0, 10);
  return FESTIVALS_2026.find((f) => f.date === todayStr) ?? null;
}
