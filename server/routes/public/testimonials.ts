import { Router } from "express";
import { query } from "../../lib/db";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await query("testimonials", "select", {
      eq: [["active", true]],
      order: { column: "date", ascending: false },
    });
    res.json({ testimonials: rows });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.get("/featured", async (req, res) => {
  const limit = Number(req.query.limit) || 6;
  try {
    const { rows } = await query("testimonials", "select", {
      eq: [["active", true], ["featured", true]],
      order: { column: "display_order", ascending: true },
      limit,
    });
    res.json({ testimonials: rows });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
