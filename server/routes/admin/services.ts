import { Router } from "express";
import { query } from "../../lib/db";
import { serviceSchema } from "../../lib/admin/service-schema";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await query("services", "select", {
      order: [{ column: "display_order", ascending: true }, { column: "title", ascending: true }],
    });
    res.json({ services: rows });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const { rows } = await query("services", "select", {
      eq: [["slug", req.params.slug]],
    });
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json({ service: rows[0] });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.post("/", async (req, res) => {
  const parsed = serviceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.flatten() });
  const s = parsed.data;
  try {
    await query("services", "insert", {
      data: {
        slug: s.slug,
        title: s.title,
        category_slug: s.categorySlug || "astrology-consultations",
        icon: s.icon,
        image: s.image ?? null,
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
      },
    });
    res.json({ ok: true, slug: s.slug });
  } catch (e: any) {
    if (e.code === "23505") return res.status(409).json({ error: `Slug "${s.slug}" already exists.` });
    res.status(500).json({ error: "DB error" });
  }
});

router.put("/:slug", async (req, res) => {
  const parsed = serviceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.flatten() });
  const s = parsed.data;
  const { slug } = req.params;
  try {
    const { rows } = await query("services", "update", {
      eq: [["slug", slug]],
      data: {
        slug: s.slug,
        title: s.title,
        category_slug: s.categorySlug || "astrology-consultations",
        icon: s.icon,
        image: s.image ?? null,
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
      },
    });
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true, slug: s.slug });
  } catch (e: any) {
    if (e.code === "23505") return res.status(409).json({ error: `Slug "${s.slug}" already exists.` });
    res.status(500).json({ error: "DB error" });
  }
});

router.delete("/:slug", async (req, res) => {
  try {
    const { rowCount } = await query("services", "delete", {
      eq: [["slug", req.params.slug]],
    });
    if (!rowCount) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
