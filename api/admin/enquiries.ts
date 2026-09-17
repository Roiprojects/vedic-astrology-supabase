import { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supa: SupabaseClient = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ""
);
const JWT_SECRET = process.env.JWT_SECRET || "";

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

  if (req.method === "GET") {
    const status = (req.query as any)?.status as string | undefined;
    let q = supa.from("enquiries").select("*").order("created_at", { ascending: false }).limit(200);
    if (status) q = q.eq("status", status);
    q.then(({ data, error }) => {
      if (error) return res.status(500).json({ error: "DB error" });
      res.status(200).json({ enquiries: data || [] });
    });
    return;
  }

  if (req.method === "PUT") {
    if (!isAuthorized(req, res)) return;
    const id = (req.query as any)?.id as string | undefined;
    const { status } = (req as any).body || {};
    if (!status) return res.status(400).json({ error: "status required" });
    if (!id) return res.status(404).json({ error: "Not found" });
    supa.from("enquiries").update({ status, updated_at: new Date().toISOString() }).eq("id", id).select("*").maybeSingle().then(({ data, error }) => {
      if (error || !data) return res.status(404).json({ error: "Not found" });
      res.status(200).json({ ok: true });
    });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
