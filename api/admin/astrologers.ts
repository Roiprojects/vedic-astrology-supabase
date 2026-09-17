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

  const queryParams = req.query as any;
  const slug = queryParams?.slug as string | undefined;

  if (req.method === "GET") {
    if (slug) {
      supa.from("astrologers").select("*").eq("slug", slug).maybeSingle().then(({ data, error }) => {
        if (error || !data) return res.status(404).json({ error: "Not found" });
        res.status(200).json({ astrologer: data });
      });
      return;
    }
    supa.from("astrologers").select("*").order("display_order", { ascending: true }).order("name", { ascending: true }).then(({ data, error }) => {
      if (error) return res.status(500).json({ error: "DB error" });
      res.status(200).json({ astrologers: data || [] });
    });
    return;
  }

  if (!isAuthorized(req, res)) return;
  const body = (req as any).body || {};

  if (req.method === "POST") {
    supa.from("astrologers").insert({
      slug: body.slug, name: body.name, title: body.title || "", image: body.image ?? null,
      verified: !!body.verified, online: !!body.online, rating: body.rating ?? 4.5,
      reviews: body.reviews ?? 0, experience_years: body.experienceYears ?? 0,
      languages: body.languages || [], specialties: body.specialties || [],
      price_chat: body.priceChat ?? 0, price_call: body.priceCall ?? 0,
      about: body.about || "", service_slug: body.serviceSlug ?? null,
      featured: !!body.featured, display_order: body.order ?? 0, active: body.active ?? true,
    }).select("*").maybeSingle().then(({ error, data }) => {
      if (error) {
        if (error.code === "23505") return res.status(409).json({ error: `Slug "${body.slug}" already exists.` });
        return res.status(500).json({ error: "DB error" });
      }
      res.status(200).json({ ok: true, astrologer: data });
    });
    return;
  }

  if (req.method === "PUT" && slug) {
    supa.from("astrologers").update({
      slug: body.slug, name: body.name, title: body.title || "", image: body.image ?? null,
      verified: !!body.verified, online: !!body.online, rating: body.rating ?? 4.5,
      reviews: body.reviews ?? 0, experience_years: body.experienceYears ?? 0,
      languages: body.languages || [], specialties: body.specialties || [],
      price_chat: body.priceChat ?? 0, price_call: body.priceCall ?? 0,
      about: body.about || "", service_slug: body.serviceSlug ?? null,
      featured: !!body.featured, display_order: body.order ?? 0, active: body.active ?? true,
    }).eq("slug", slug).select("*").maybeSingle().then(({ error, data }) => {
      if (error) {
        if (error.code === "23505") return res.status(409).json({ error: `Slug "${body.slug}" already exists.` });
        return res.status(500).json({ error: "DB error" });
      }
      if (!data) return res.status(404).json({ error: "Not found" });
      res.status(200).json({ ok: true });
    });
    return;
  }

  if (req.method === "DELETE" && slug) {
    supa.from("astrologers").delete({ count: "exact" }).eq("slug", slug).then(({ error, count }) => {
      if (error) return res.status(500).json({ error: "DB error" });
      if (!count) return res.status(404).json({ error: "Not found" });
      res.status(200).json({ ok: true });
    });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
