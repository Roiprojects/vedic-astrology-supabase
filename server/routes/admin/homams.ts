import { Router } from "express";
import { query } from "../../lib/db";
import { homamSchema } from "../../lib/admin/homam-schema";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await query("homams", "select", {
      order: [{ column: "display_order", ascending: true }, { column: "name", ascending: true }],
    });
    res.json({ homams: rows });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const { rows } = await query("homams", "select", {
      eq: [["slug", req.params.slug]],
    });
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json({ homam: rows[0] });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.post("/", async (req, res) => {
  const parsed = homamSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.flatten() });
  const h = parsed.data;
  try {
    await query("homams", "insert", {
      data: {
        slug: h.slug,
        name: h.name,
        icon: h.icon,
        image: h.image ?? null,
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
      },
    });
    res.json({ ok: true, slug: h.slug });
  } catch (e: any) {
    if (e.code === "23505") return res.status(409).json({ error: `Slug "${h.slug}" already exists.` });
    res.status(500).json({ error: "DB error" });
  }
});

router.put("/:slug", async (req, res) => {
  const parsed = homamSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.flatten() });
  const h = parsed.data;
  const { slug } = req.params;
  try {
    const { rows } = await query("homams", "update", {
      eq: [["slug", slug]],
      data: {
        slug: h.slug,
        name: h.name,
        icon: h.icon,
        image: h.image ?? null,
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
      },
    });
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true, slug: h.slug });
  } catch (e: any) {
    if (e.code === "23505") return res.status(409).json({ error: `Slug "${h.slug}" already exists.` });
    res.status(500).json({ error: "DB error" });
  }
});

router.delete("/:slug", async (req, res) => {
  try {
    const { rowCount } = await query("homams", "delete", {
      eq: [["slug", req.params.slug]],
    });
    if (!rowCount) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
