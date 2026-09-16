/**
 * Domain types. These map to the PostgreSQL tables used by the data-access
 * layer (lib/data/index.ts).
 */

export type Faq = {
  question: string;
  answer: string;
};

export type ServiceCategory = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  order: number;
};

export type Service = {
  slug: string;
  title: string;
  categorySlug: string;
  icon: string;
  image?: string;
  shortDescription: string;
  fullDescription: string;
  problem: string;
  price: number;
  discountPrice?: number | null;
  duration: string;
  gradient: string;
  /** Astrology analysis included: houses, planets, doshas, dasha/transit, remedies. */
  analysis: string[];
  /** What the user will receive. */
  receive: string[];
  benefits: string[];
  remedies: string[];
  faqs: Faq[];
  featured: boolean;
  order: number;
  active: boolean;
};

export type Homam = {
  slug: string;
  name: string;
  icon: string;
  image?: string;
  shortBenefit: string;
  fullDescription: string;
  price: number;
  discountPrice?: number | null;
  duration: string;
  gradient: string;
  benefits: string[];
  suitableFor: string[];
  poojaItems: string[];
  bookingInstructions: string;
  faqs: Faq[];
  featured: boolean;
  order: number;
  active: boolean;
};

export type Testimonial = {
  id: string;
  name: string;
  location: string;
  rating: number;
  serviceType: string; // matches a filter key
  text: string;
  date: string; // ISO
  avatarInitial: string;
  featured: boolean;
};

export type TrustHighlight = {
  icon: string;
  title: string;
  description: string;
};

export type Offering = {
  title: string;
  description: string;
  icon: string;
  price?: string;
  cta: string;
  href: string;
  gradient: string;
};

export type Stat = {
  value: string;
  label: string;
};

export type ValueCard = {
  icon: string;
  title: string;
  description: string;
};

export type ProcessStep = {
  step: number;
  title: string;
  description: string;
  icon: string;
};
