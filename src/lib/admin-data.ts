/**
 * Admin data access — all calls go to the Express API (PostgreSQL-backed).
 */
import { apiFetch } from "@/lib/api";
import { pageDefaults, type PageContent, type PageId } from "@/lib/data/pages-store";
import type { Homam, Service } from "@/lib/data/types";

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
    image: row.image ?? undefined,
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

export async function getAdminServices(): Promise<Service[]> {
  const res = await apiFetch("/api/admin/services");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load services");
  return (data.services ?? []).map(mapServiceRow);
}

export async function getAdminService(slug: string): Promise<Service | null> {
  const res = await apiFetch(`/api/admin/services/${slug}`);
  const data = await res.json();
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(data.error || "Failed to load service");
  return mapServiceRow(data.service);
}

export async function saveAdminService(service: Service): Promise<void> {
  const existing = await getAdminService(service.slug);
  const method = existing ? "PUT" : "POST";
  const url = existing ? `/api/admin/services/${service.slug}` : "/api/admin/services";
  const body = {
    slug: service.slug, title: service.title, categorySlug: service.categorySlug,
    icon: service.icon, image: service.image ?? null,
    shortDescription: service.shortDescription, fullDescription: service.fullDescription,
    problem: service.problem, price: service.price, discountPrice: service.discountPrice ?? null,
    duration: service.duration, gradient: service.gradient, analysis: service.analysis,
    receive: service.receive, benefits: service.benefits, remedies: service.remedies,
    faqs: service.faqs, featured: service.featured, order: service.order, active: service.active,
  };
  const res = await apiFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save service");
}

export async function deleteAdminService(slug: string): Promise<void> {
  const res = await apiFetch(`/api/admin/services/${slug}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete service");
}

export async function getAdminHomams(): Promise<Homam[]> {
  const res = await apiFetch("/api/admin/homams");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load homams");
  return (data.homams ?? []).map(mapHomamRow);
}

export async function getAdminHomam(slug: string): Promise<Homam | null> {
  const res = await apiFetch(`/api/admin/homams/${slug}`);
  const data = await res.json();
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(data.error || "Failed to load homam");
  return mapHomamRow(data.homam);
}

export async function saveAdminHomam(homam: Homam): Promise<void> {
  const existing = await getAdminHomam(homam.slug);
  const method = existing ? "PUT" : "POST";
  const url = existing ? `/api/admin/homams/${homam.slug}` : "/api/admin/homams";
  const body = {
    slug: homam.slug, name: homam.name, icon: homam.icon, image: homam.image ?? null,
    shortBenefit: homam.shortBenefit,
    fullDescription: homam.fullDescription, price: homam.price, discountPrice: homam.discountPrice ?? null,
    duration: homam.duration, gradient: homam.gradient, benefits: homam.benefits,
    suitableFor: homam.suitableFor, poojaItems: homam.poojaItems,
    bookingInstructions: homam.bookingInstructions, faqs: homam.faqs,
    featured: homam.featured, order: homam.order, active: homam.active,
  };
  const res = await apiFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save homam");
}

export async function deleteAdminHomam(slug: string): Promise<void> {
  const res = await apiFetch(`/api/admin/homams/${slug}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete homam");
}

export async function getAdminPageContent(pageId: PageId): Promise<PageContent> {
  const res = await apiFetch(`/api/admin/pages/${pageId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load page content");
  const content = data.content && typeof data.content === "object" ? data.content : {};
  return { ...pageDefaults(pageId), ...content } as PageContent;
}

export async function saveAdminPageContent(pageId: PageId, content: PageContent): Promise<void> {
  const res = await apiFetch(`/api/admin/pages/${pageId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save page content");
}
