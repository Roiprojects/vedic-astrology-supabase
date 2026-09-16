// Admin Pages routes
import { Router } from "express";
import { query } from "../../lib/db";
import { isPageId } from "../../../src/lib/data/pages-store";
import { pageContentSchema } from "../../lib/admin/page-content-schema";

const router = Router();

router.get("/:page", async (req, res) => {
  const { page } = req.params;
  if (!isPageId(page)) return res.status(404).json({ error: "Unknown page." });
  try {
    const { rows } = await query("pages", "select", {
      select: "content",
      eq: [["slug", page]],
    });
    res.json({ page, content: rows[0]?.content ?? {} });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.put("/:page", async (req, res) => {
  const { page } = req.params;
  if (!isPageId(page)) return res.status(404).json({ error: "Unknown page." });
  const parsed = pageContentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.flatten() });
  const content = { ...parsed.data, price: parsed.data.price ?? null };
  try {
    await query("pages", "upsert", {
      data: {
        slug: page,
        title: content.title ?? page,
        content,
        active: true,
      },
      onConflict: "slug",
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
