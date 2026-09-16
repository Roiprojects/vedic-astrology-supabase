/**
 * Data-access layer — all public queries go to the Express/PostgreSQL API.
 * Falls back to seed data if the API is unreachable.
 */
import { apiFetch } from "@/lib/api";
import { serviceCategories } from "./categories";
import { testimonials as seedTestimonials } from "./testimonials";
import { homeFaqs } from "./faqs";
import { services as seedServices } from "./services";
import { homams as seedHomams } from "./homams";
import {
  type PageContent,
  type PageId,
  PAGE_CONFIG,
  pageDefaults,
} from "./pages-store";
import type { Homam, Service, ServiceCategory, Testimonial } from "./types";

export { PAGE_CONFIG, isPageId, allPageIds, pageDefaults } from "./pages-store";
export type { PageId, PageContent } from "./pages-store";

// ── Row mappers ────────────────────────────────────────────
function mapServiceRow(row: Record<string, any>): Service {
  return {
    slug: row.slug,
    title: row.title,
    categorySlug: row.category_slug ?? "",
    icon: row.icon ?? "🔮",
    image: row.image ?? undefined,
    shortDescription: row.short_description ?? "",
    fullDescription: row.full_description ?? "",
    problem: row.problem ?? "",
    price: row.price ?? 0,
    discountPrice: row.discount_price ?? null,
    duration: row.duration ?? "",
    gradient: row.gradient ?? "",
    analysis: row.analysis ?? [],
    receive: row.receive ?? [],
    benefits: row.benefits ?? [],
    remedies: row.remedies ?? [],
    faqs: row.faqs ?? [],
    featured: row.featured ?? false,
    order: row.display_order ?? 0,
    active: row.active ?? true,
  };
}

function mapHomamRow(row: Record<string, any>): Homam {
  return {
    slug: row.slug,
    name: row.name,
    icon: row.icon ?? "🔥",
    shortBenefit: row.short_benefit ?? "",
    fullDescription: row.full_description ?? "",
    price: row.price ?? 0,
    discountPrice: row.discount_price ?? null,
    duration: row.duration ?? "",
    gradient: row.gradient ?? "",
    benefits: row.benefits ?? [],
    suitableFor: row.suitable_for ?? [],
    poojaItems: row.pooja_items ?? [],
    bookingInstructions: row.booking_instructions ?? "",
    faqs: row.faqs ?? [],
    featured: row.featured ?? false,
    order: row.display_order ?? 0,
    active: row.active ?? true,
  };
}

function mapTestimonialRow(row: Record<string, any>): Testimonial {
  return {
    id: String(row.id),
    name: row.name,
    location: row.location ?? "",
    rating: row.rating ?? 5,
    serviceType: row.service_type ?? "all",
    text: row.text,
    date: row.date ? String(row.date).slice(0,10) : "",
    avatarInitial: row.avatar_initial ?? row.name?.[0] ?? "G",
    featured: row.featured ?? false,
  };
}

async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await apiFetch(path);
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

// ── Page content ────────────────────────────────────────────
export async function getPageContent(id: PageId): Promise<PageContent> {
  const data = await apiGet<{ content: Record<string, unknown> }>(`/api/public/pages/${id}`);
  if (!data?.content) return pageDefaults(id);
  return { ...pageDefaults(id), ...data.content } as PageContent;
}

// ── Service categories (static) ─────────────────────────────
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  return [...serviceCategories].sort((a, b) => a.order - b.order);
}

// ── Services ────────────────────────────────────────────────
export async function getServices(): Promise<Service[]> {
  const data = await apiGet<{ services: Record<string, any>[] }>("/api/public/services");
  if (data?.services?.length) return data.services.map(mapServiceRow);
  return seedServices.filter((s) => s.active).sort((a, b) => a.order - b.order);
}

export async function getFeaturedServices(limit = 6): Promise<Service[]> {
  const data = await apiGet<{ services: Record<string, any>[] }>(`/api/public/services/featured?limit=${limit}`);
  if (data?.services?.length) return data.services.map(mapServiceRow);
  const list = seedServices.filter((s) => s.active && s.featured).sort((a, b) => a.order - b.order);
  return (list.length ? list : seedServices).slice(0, limit);
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  const data = await apiGet<{ service: Record<string, any> }>(`/api/public/services/${slug}`);
  if (data?.service) return mapServiceRow(data.service);
  return seedServices.find((s) => s.slug === slug && s.active);
}

export function getAllServiceSlugs(): string[] {
  return seedServices.map((s) => s.slug);
}

export function getServicesForAdmin(): Service[] {
  return [...seedServices].sort((a, b) => a.order - b.order);
}

export function getServiceForAdmin(slug: string): Service | undefined {
  return seedServices.find((s) => s.slug === slug);
}

// ── Homams ──────────────────────────────────────────────────
export async function getHomams(): Promise<Homam[]> {
  const data = await apiGet<{ homams: Record<string, any>[] }>("/api/public/homams");
  if (data?.homams?.length) return data.homams.map(mapHomamRow);
  return seedHomams.filter((h) => h.active).sort((a, b) => a.order - b.order);
}

export async function getFeaturedHomams(limit = 6): Promise<Homam[]> {
  const data = await apiGet<{ homams: Record<string, any>[] }>(`/api/public/homams/featured?limit=${limit}`);
  if (data?.homams?.length) return data.homams.map(mapHomamRow);
  const list = seedHomams.filter((h) => h.active && h.featured).sort((a, b) => a.order - b.order);
  return (list.length ? list : seedHomams).slice(0, limit);
}

export async function getHomamBySlug(slug: string): Promise<Homam | undefined> {
  const data = await apiGet<{ homam: Record<string, any> }>(`/api/public/homams/${slug}`);
  if (data?.homam) return mapHomamRow(data.homam);
  return seedHomams.find((h) => h.slug === slug && h.active);
}

export function getAllHomamSlugs(): string[] {
  return seedHomams.map((h) => h.slug);
}

export function getHomamsForAdmin(): Homam[] {
  return [...seedHomams].sort((a, b) => a.order - b.order);
}

export function getHomamForAdmin(slug: string): Homam | undefined {
  return seedHomams.find((h) => h.slug === slug);
}

// ── Testimonials ─────────────────────────────────────────────
export async function getTestimonials(): Promise<Testimonial[]> {
  const data = await apiGet<{ testimonials: Record<string, any>[] }>("/api/public/testimonials");
  if (data?.testimonials?.length) return data.testimonials.map(mapTestimonialRow);
  return [...seedTestimonials].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getFeaturedTestimonials(limit = 6): Promise<Testimonial[]> {
  const data = await apiGet<{ testimonials: Record<string, any>[] }>(`/api/public/testimonials/featured?limit=${limit}`);
  if (data?.testimonials?.length) return data.testimonials.map(mapTestimonialRow);
  const list = seedTestimonials.filter((t) => t.featured);
  return (list.length ? list : seedTestimonials).slice(0, limit);
}

export function getHomeFaqs() {
  return [...homeFaqs];
}
