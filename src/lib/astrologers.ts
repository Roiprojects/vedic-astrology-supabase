export type AstrologerSpecialty =
  | "Vedic Astrology"
  | "KP Astrology"
  | "Numerology"
  | "Tarot"
  | "Vastu"
  | "Palmistry"
  | "Relationship"
  | "Marriage"
  | "Career"
  | "Finance";

export type Astrologer = {
  id: string;
  name: string;
  title: string;
  image: string;
  verified: boolean;
  online: boolean;
  rating: number;
  reviews: number;
  experienceYears: number;
  languages: string[];
  specialties: AstrologerSpecialty[];
  priceChat: number;
  priceCall: number;
  about: string;
  serviceSlug?: string;
};

export const ASTROLOGER_CATEGORIES: AstrologerSpecialty[] = [
  "Vedic Astrology",
  "KP Astrology",
  "Numerology",
  "Tarot",
  "Vastu",
  "Palmistry",
  "Relationship",
  "Marriage",
  "Career",
  "Finance",
];

export const astrologers: Astrologer[] = [
  {
    id: "guruji",
    name: "Guruji",
    title: "Founder • Vedic Master",
    image: "/images/rishi-guruji.svg",
    verified: true,
    online: true,
    rating: 4.9,
    reviews: 1280,
    experienceYears: 25,
    languages: ["English", "Kannada", "Hindi", "Telugu"],
    specialties: ["Vedic Astrology", "Marriage", "Career", "Relationship"],
    priceChat: 2000,
    priceCall: 2500,
    about:
      "Authentic Vedic guidance grounded in classical Jyotisha. Consultations cover kundli, dasha, dosha, and practical remedies.",
    serviceSlug: "janna-jataka-comprehensive-birth-chart",
  },
  {
    id: "vedic-relationship",
    name: "Acharya Meera",
    title: "Relationship & Compatibility",
    image: "/images/rishi-guruji.svg",
    verified: true,
    online: true,
    rating: 4.8,
    reviews: 640,
    experienceYears: 14,
    languages: ["English", "Hindi"],
    specialties: ["Relationship", "Marriage", "Vedic Astrology"],
    priceChat: 1800,
    priceCall: 2200,
    about: "Specialises in Venus, the 7th house, guna matching, and restoring harmony in partnerships.",
    serviceSlug: "love-relationship-problems",
  },
  {
    id: "career-guide",
    name: "Pandit Arjun Rao",
    title: "Career & Dasha Timing",
    image: "/images/rishi-guruji.svg",
    verified: true,
    online: false,
    rating: 4.7,
    reviews: 410,
    experienceYears: 18,
    languages: ["English", "Kannada", "Tamil"],
    specialties: ["Career", "Finance", "Vedic Astrology"],
    priceChat: 1600,
    priceCall: 2100,
    about: "Focuses on 10th-house strength, Saturn transits, and timing for job change or business.",
    serviceSlug: "career-confusion-job-problems",
  },
  {
    id: "palm-vastu",
    name: "Smt. Lakshmi Sharma",
    title: "Palmistry & Vastu",
    image: "/images/rishi-guruji.svg",
    verified: true,
    online: true,
    rating: 4.6,
    reviews: 290,
    experienceYears: 12,
    languages: ["English", "Hindi", "Marathi"],
    specialties: ["Palmistry", "Vastu", "Numerology"],
    priceChat: 1200,
    priceCall: 1600,
    about: "Reads the five major lines and mounts, then aligns home directions with planetary remedies.",
    serviceSlug: undefined,
  },
  {
    id: "kp-timing",
    name: "Prof. Nikhil Iyer",
    title: "KP Astrology & Muhurat",
    image: "/images/rishi-guruji.svg",
    verified: true,
    online: true,
    rating: 4.8,
    reviews: 355,
    experienceYears: 16,
    languages: ["English", "Malayalam"],
    specialties: ["KP Astrology", "Career", "Finance"],
    priceChat: 1900,
    priceCall: 2400,
    about: "Uses Krishnamurti Paddhati sub-lords for precise event timing, interviews, and muhurat.",
    serviceSlug: "janna-jataka-comprehensive-birth-chart",
  },
];

export function filterAstrologers(opts: {
  query?: string;
  specialty?: string;
  language?: string;
  sort?: "rating" | "price" | "experience";
  onlineOnly?: boolean;
}): Astrologer[] {
  let list = [...astrologers];
  const q = opts.query?.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.specialties.some((s) => s.toLowerCase().includes(q)) ||
        a.languages.some((l) => l.toLowerCase().includes(q))
    );
  }
  if (opts.specialty && opts.specialty !== "all") {
    list = list.filter((a) => a.specialties.includes(opts.specialty as AstrologerSpecialty));
  }
  if (opts.language && opts.language !== "all") {
    list = list.filter((a) => a.languages.includes(opts.language!));
  }
  if (opts.onlineOnly) list = list.filter((a) => a.online);
  if (opts.sort === "price") list.sort((a, b) => a.priceChat - b.priceChat);
  else if (opts.sort === "experience") list.sort((a, b) => b.experienceYears - a.experienceYears);
  else list.sort((a, b) => b.rating - a.rating);
  return list;
}
