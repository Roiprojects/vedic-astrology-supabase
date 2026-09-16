/**
 * Admin Seed route — seeds database via Supabase query helper.
 * Admin-only (protected by adminAuthMiddleware).
 *
 * POST /api/admin/seed
 */

import { Router, Response } from "express";
import { query } from "../../lib/db";
import { readServicesRaw } from "../../lib/data/services-store";
import { homams } from "../../../src/lib/data/homams";
import { testimonials } from "../../../src/lib/data/testimonials";
import { serviceCategories } from "../../../src/lib/data/categories";

const router = Router();

router.post("/", async (_req, res: Response) => {
  const services = await readServicesRaw();

  const categoryRows = serviceCategories.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    icon: c.icon,
    href: c.href,
    display_order: c.order,
  }));

  const serviceRows = services.map((s) => ({
    slug: s.slug,
    title: s.title,
    category_slug: s.categorySlug,
    icon: s.icon,
    image: s.image || null,
    short_description: s.shortDescription,
    full_description: s.fullDescription,
    problem: s.problem,
    price: s.price,
    discount_price: s.discountPrice ?? null,
    duration: s.duration,
    gradient: s.gradient,
    analysis: s.analysis,
    receive: s.receive,
    benefits: s.benefits,
    remedies: s.remedies,
    faqs: s.faqs,
    featured: s.featured,
    display_order: s.order,
    active: s.active,
  }));

  const homamRows = homams.map((h) => ({
    slug: h.slug,
    name: h.name,
    icon: h.icon,
    image: h.image || null,
    short_benefit: h.shortBenefit,
    full_description: h.fullDescription,
    price: h.price,
    discount_price: h.discountPrice ?? null,
    duration: h.duration,
    gradient: h.gradient,
    benefits: h.benefits,
    suitable_for: h.suitableFor,
    pooja_items: h.poojaItems,
    booking_instructions: h.bookingInstructions,
    faqs: h.faqs,
    featured: h.featured,
    display_order: h.order,
    active: h.active,
  }));

  const testimonialRows = testimonials.map((t, i) => ({
    name: t.name,
    location: t.location,
    rating: t.rating,
    service_type: t.serviceType,
    text: t.text,
    date: t.date,
    avatar_initial: t.avatarInitial,
    featured: t.featured,
    active: true,
    display_order: i,
  }));

  try {
    for (const cat of categoryRows) {
      await query("service_categories", "upsert", {
        data: cat,
        onConflict: "slug",
      });
    }

    for (const svc of serviceRows) {
      await query("services", "upsert", {
        data: {
          ...svc,
          analysis: JSON.stringify(svc.analysis),
          receive: JSON.stringify(svc.receive),
          benefits: JSON.stringify(svc.benefits),
          remedies: JSON.stringify(svc.remedies),
          faqs: JSON.stringify(svc.faqs),
        },
        onConflict: "slug",
      });
    }

    for (const h of homamRows) {
      await query("homams", "upsert", {
        data: {
          ...h,
          benefits: JSON.stringify(h.benefits),
          suitable_for: JSON.stringify(h.suitable_for),
          pooja_items: JSON.stringify(h.pooja_items),
          faqs: JSON.stringify(h.faqs),
        },
        onConflict: "slug",
      });
    }

    const countRow = await query("testimonials", "select", { select: "id", limit: 1 });
    if (countRow.rows.length === 0) {
      for (const t of testimonialRows) {
        await query("testimonials", "insert", { data: t });
      }
    }

    return res.json({
      ok: true,
      seeded: {
        categories: categoryRows.length,
        services: serviceRows.length,
        homams: homamRows.length,
        testimonials: countRow.rows.length === 0 ? testimonialRows.length : "skipped (already present)",
      },
    });
  } catch (e) {
    console.error("[admin/seed] db error:", e);
    return res.status(500).json({ error: `Seeding failed: ${(e as Error).message}` });
  }
});

export default router;
