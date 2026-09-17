import { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supa: SupabaseClient = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ""
);
const JWT_SECRET = process.env.JWT_SECRET || "";
const VALID_PAGES = ["birth-chart-pdf", "chat-with-guruji", "palm-reading"];

function getCookie(req: VercelRequest, name: string): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  const match = raw.split(";").map((c) => c.trim()).find((c) => c.startsWith(name + "="));
  if (!match) return undefined;
  return decodeURIComponent(match.slice(name.length + 1));
}

function isAuthorized(req: VercelRequest, res: VercelResponse): boolean {
  const token = getCookie(req, "admin_token");
  if (!token || !JWT_SECRET) { res.status(401).json({ error: "Unauthorized" }); return false; }
  try { const p = jwt.verify(token, JWT_SECRET) as { isAdmin: boolean }; if (!p.isAdmin) { res.status(403).json({ error: "Forbidden" }); return false; } }
  catch { res.status(401).json({ error: "Invalid or expired session" }); return false; }
  return true;
}

const corsHeaders = (res: VercelResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

export const config = { maxDuration: 10 };

export default function handler(req: VercelRequest, res: VercelResponse) {
  corsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const page = (req.query as any)?.page as string | undefined;
  if (!page || !VALID_PAGES.includes(page)) return res.status(404).json({ error: "Unknown page." });

  if (req.method === "GET") {
    supa.from("pages").select("content").eq("slug", page).maybeSingle().then(({ data }) => {
      res.status(200).json({ page, content: data?.content ?? {} });
    });
    return;
  }

  if (!isAuthorized(req, res)) return;

  const body = (req as any).body || {};
  const content = { ...body, price: body.price ?? null };

  supa.from("pages").upsert({ slug: page, title: content.title ?? page, content, active: true }, { onConflict: "slug" }).then(({ error }) => {
    if (error) return res.status(500).json({ error: "DB error" });
    res.status(200).json({ ok: true });
  });
}
