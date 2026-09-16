import { Router } from "express";
import { query } from "../../lib/db";
import { z } from "zod";

const router = Router();

const testimonialSchema = z.object({
  name: z.string().trim().min(1).max(100),
  location: z.string().trim().max(100).default(""),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  service_type: z.string().trim().default("all"),
  text: z.string().trim().min(1).max,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).default(() => new Date().toISOString().slice(0, 10)),
  avatar_initial: z.string().trim().max(2).default(""),
  featured: z.boolean().default(false),
  display_order: z.coerce.number().int().default(0),
  active: z.boolean().default(true),
});

router.get("/", async (_req, res) => {
  try {
    const { rows } = await query("testimonials", "select", {
      order: [{ column: "display_order", ascending: true }, { column: "date", ascending: false }],
    });
    res.json({ testimonials: rows });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.post("/", async (req, res) => {
  const parsed = testimonialSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.flatten() });
  const t = parsed.data;
  try {
    const { rows } = await query("testimonials", "insert", {
      data: {
        name: t.name,
        location: t.location,
        rating: t.rating,
        service_type: t.service_type,
        text: t.text,
        date: t.date,
        avatar_initial: t.avatar_initial || t.name[0] || "G",
        featured: t.featured,
        display_order: t.display_order,
        active: t.active,
      },
    });
    res.json({ ok: true, testimonial: rows[0] });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.put("/:id", async (req, res) => {
  const parsed = testimonialSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.flatten() });
  const t = parsed.data;
  try {
    const { rows } = await query("testimonials", "update", {
      eq: [["id", req.params.id]],
      data: {
        name: t.name,
        location: t.location,
        rating: t.rating,
        service_type: t.service_type,
        text: t.text,
        date: t.date,
        avatar_initial: t.avatar_initial || t.name[0] || "G",
        featured: t.featured,
        display_order: t.display_order,
        active: t.active,
      },
    });
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { rowCount } = await query("testimonials", "delete", {
      eq: [["id", req.params.id]],
    });
    if (!rowCount) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
