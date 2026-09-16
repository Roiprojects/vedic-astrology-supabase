import { Router } from "express";
import { query } from "../../lib/db";

const router = Router();

router.get("/", async (req, res) => {
  const status = req.query.status as string | undefined;
  try {
    const { rows } = status
      ? await query("enquiries", "select", {
          eq: [["status", status]],
          order: [{ column: "created_at", ascending: false }],
          limit: 200,
        })
      : await query("enquiries", "select", {
          order: [{ column: "created_at", ascending: false }],
          limit: 200,
        });
    res.json({ enquiries: rows });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.put("/:id/status", async (req, res) => {
  const { status } = req.body as { status?: string };
  if (!status) return res.status(400).json({ error: "status required" });
  try {
    const { rows } = await query("enquiries", "update", {
      eq: [["id", req.params.id]],
      data: { status, updated_at: new Date().toISOString() },
    });
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
