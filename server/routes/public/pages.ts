import { Router } from "express";
import { query } from "../../lib/db";

const router = Router();

router.get("/:slug", async (req, res) => {
  try {
    const { rows } = await query("pages", "select", {
      select: "content",
      eq: [["slug", req.params.slug]],
    });
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json({ content: rows[0].content });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
