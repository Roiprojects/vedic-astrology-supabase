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
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

export const config = { maxDuration: 10 };

export default function handler(req: VercelRequest, res: VercelResponse) {
  corsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const id = (req.query as any)?.id as string | undefined;

  if (req.method === "GET") {
    supa.from("testimonials").select("*").order("display_order", { ascending: true }).order("date", { ascending: false }).then(({ data, error }) => {
      if (error) return res.status(500).json({ error: "DB error" });
      res.status(200).json({ testimonials: data || [] });
    });
    return;
  }

  if (!isAuthorized(req, res)) return;
  const body = (req as any).body || {};

  if (req.method === "POST") {
    supa.from("testimonials").insert({
      name: body.name, location: body.location || "", rating: body.rating ?? 5,
      service_type: body.serviceType || "all", text: body.text,
      date: body.date || new Date().toISOString().slice(0, 10),
      avatar_initial: (body.avatarInitial || body.name?.[0] || "G").slice(0, 2),
      featured: !!body.featured, display_order: body.displayOrder ?? 0, active: body.active ?? true,
    }).select("*").maybeSingle().then(({ error, data }) => {
      if (error) return res.status(500).json({ error: "DB error" });
      res.status(200).json({ ok: true, testimonial: data });
    });
    return;
  }

  if (req.method === "PUT" && id) {
    supa.from("testimonials").update({
      name: body.name, location: body.location || "", rating: body.rating ?? 5,
      service_type: body.serviceType || "all", text: body.text,
      date: body.date || new Date().toISOString().slice(0, 10),
      avatar_initial: (body.avatarInitial || body.name?.[0] || "G").slice(0, 2),
      featured: !!body.featured, display_order: body.displayOrder ?? 0, active: body.active ?? true,
    }).eq("id", id).select("*").maybeSingle().then(({ data, error }) => {
      if (error) return res.status(500).json({ error: "DB error" });
      if (!data) return res.status(404).json({ error: "Not found" });
      res.status(200).json({ ok: true });
    });
    return;
  }

  if (req.method === "DELETE" && id) {
    supa.from("testimonials").delete({ count: "exact" }).eq("id", id).then(({ error, count }) => {
      if (error) return res.status(500).json({ error: "DB error" });
      if (!count) return res.status(404).json({ error: "Not found" });
      res.status(200).json({ ok: true });
    });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
