import { Router } from "express";
import { query } from "../../lib/db";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await query("services", "select", {
      eq: [["active", true]],
      order: { column: "display_order", ascending: true },
    });
    res.json({ services: rows });
  } catch (err) {
    console.error("[services] list error:", err);
    res.status(500).json({ error: "DB error" });
  }
});

router.get("/featured", async (req, res) => {
  const limit = Number(req.query.limit) || 6;
  try {
    const { rows } = await query("services", "select", {
      eq: [["active", true], ["featured", true]],
      order: { column: "display_order", ascending: true },
      limit,
    });
    res.json({ services: rows });
  } catch (err) {
    console.error("[services] featured error:", err);
    res.status(500).json({ error: "DB error" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const { rows } = await query("services", "select", {
      eq: [["slug", req.params.slug], ["active", true]],
    });
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json({ service: rows[0] });
  } catch (err) {
    console.error("[services] by slug error:", err);
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
