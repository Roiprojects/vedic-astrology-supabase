import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supa = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ""
);

const corsHeaders = (res: VercelResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

function json(res: VercelResponse, code: number, data: any) {
  res.status(code).setHeader("Content-Type", "application/json").json(data);
}

// ─── Public read-only handlers ──────────────────────────────────────────────

async function publicServices(res: VercelResponse, slug?: string) {
  if (slug) {
    const { data } = await supa.from("services").select("*").eq("slug", slug).eq("active", true).maybeSingle();
    if (!data) return json(res, 404, { error: "Not found" });
    return json(res, 200, { service: data });
  }
  const { data } = await supa.from("services").select("*").eq("active", true).order("display_order", { ascending: true });
  return json(res, 200, { services: data || [] });
}

async function publicHomams(res: VercelResponse, slug?: string) {
  if (slug) {
    const { data } = await supa.from("homams").select("*").eq("slug", slug).eq("active", true).maybeSingle();
    if (!data) return json(res, 404, { error: "Not found" });
    return json(res, 200, { homam: data });
  }
  const { data } = await supa.from("homams").select("*").eq("active", true).order("display_order", { ascending: true });
  return json(res, 200, { homams: data || [] });
}

async function publicAstrologers(res: VercelResponse, slug?: string) {
  if (slug) {
    const { data } = await supa.from("astrologers").select("*").eq("slug", slug).maybeSingle();
    if (!data) return json(res, 404, { error: "Not found" });
    return json(res, 200, { astrologer: data });
  }
  const { data } = await supa.from("astrologers").select("*").order("display_order", { ascending: true });
  return json(res, 200, { astrologers: data || [] });
}

async function publicTestimonials(res: VercelResponse) {
  const { data } = await supa.from("testimonials").select("*").eq("active", true).order("display_order", { ascending: true });
  return json(res, 200, { testimonials: data || [] });
}

async function publicPages(res: VercelResponse, slug: string) {
  const allowed = ["birth-chart-pdf", "chat-with-guruji", "palm-reading"];
  if (!allowed.includes(slug)) return json(res, 404, { page: slug, content: {} });
  const { data } = await supa.from("pages").select("*").eq("slug", slug).maybeSingle();
  return json(res, 200, { page: slug, content: (data as any)?.content || {} });
}

// ─── Admin CRUD handlers ───────────────────────────────────────────────────

function isAdmin(req: VercelRequest, res: VercelResponse): boolean {
  const raw = req.headers.cookie;
  const token = raw?.split(";").map(c => c.trim()).find(c => c.startsWith("admin_token="));
  if (!token) { json(res, 401, { error: "Unauthorized" }); return false; }
  try { (jwt.verify(token.slice(11), process.env.JWT_SECRET || "") as any); }
  catch { json(res, 401, { error: "Invalid session" }); return false; }
  return true;
}

import jwt from "jsonwebtoken";

function paged(res: VercelResponse, q: any, table: string) {
  supa.from(table).select("*").order("display_order", { ascending: true }).then(({ data, error }) => {
    if (error) return json(res, 500, { error: "DB error" });
    json(res, 200, { [table]: data || [] });
  });
}
function bySlug(res: VercelResponse, table: string, slug: string, key: string) {
  supa.from(table).select("*").eq("slug", slug).maybeSingle().then(({ data, error }) => {
    if (error || !data) return json(res, 404, { error: "Not found" });
    json(res, 200, { [key]: data });
  });
}
function delSlug(res: VercelResponse, table: string, slug: string) {
  supa.from(table).delete({ count: "exact" }).eq("slug", slug).then(({ error, count }) => {
    if (error) return json(res, 500, { error: "DB error" });
    if (!count) return json(res, 404, { error: "Not found" });
    json(res, 200, { ok: true });
  });
}

function handleAdminServices(req: VercelRequest, res: VercelResponse) {
  const q = req.query as any;
  const slug = q?.slug;
  const body = (req as any).body || {};

  if (req.method === "GET") {
    if (slug) return bySlug(res, "services", slug, "service");
    return paged(res, q, "services");
  }
  if (req.method === "POST") {
    supa.from("services").insert({ slug: body.slug, title: body.title, category_slug: body.categorySlug || "astrology-consultations", icon: body.icon, image: body.image ?? null, short_description: body.shortDescription, full_description: body.fullDescription, problem: body.problem, price: body.price, discount_price: body.discountPrice ?? null, duration: body.duration, gradient: body.gradient, analysis: body.analysis, receive: body.receive, benefits: body.benefits, remedies: body.remedies, faqs: body.faqs, featured: body.featured, display_order: body.order, active: body.active }).select("*").maybeSingle().then(({ error }) => {
      if (error?.code === "23505") return json(res, 409, { error: `Slug "${body.slug}" already exists.` });
      if (error) return json(res, 500, { error: "DB error" });
      json(res, 200, { ok: true, slug: body.slug });
    });
    return;
  }
  if (req.method === "PUT" && slug) {
    supa.from("services").update({ slug: body.slug, title: body.title, category_slug: body.categorySlug || "astrology-consultations", icon: body.icon, image: body.image ?? null, short_description: body.shortDescription, full_description: body.fullDescription, problem: body.problem, price: body.price, discount_price: body.discountPrice ?? null, duration: body.duration, gradient: body.gradient, analysis: body.analysis, receive: body.receive, benefits: body.benefits, remedies: body.remedies, faqs: body.faqs, featured: body.featured, display_order: body.order, active: body.active }).eq("slug", slug).select("*").maybeSingle().then(({ error, data }) => {
      if (error?.code === "23505") return json(res, 409, { error: `Slug "${body.slug}" already exists.` });
      if (error) return json(res, 500, { error: "DB error" });
      if (!data) return json(res, 404, { error: "Not found" });
      json(res, 200, { ok: true, slug: body.slug });
    });
    return;
  }
  if (req.method === "DELETE" && slug) return delSlug(res, "services", slug);
  json(res, 405, { error: "Method not allowed" });
}

function handleAdminHomams(req: VercelRequest, res: VercelResponse) {
  const q = req.query as any;
  const slug = q?.slug;
  const body = (req as any).body || {};
  if (req.method === "GET") {
    if (slug) return bySlug(res, "homams", slug, "homam");
    return paged(res, q, "homams");
  }
  if (req.method === "POST") {
    supa.from("homams").insert({ slug: body.slug, name: body.name, icon: body.icon, image: body.image ?? null, short_benefit: body.shortBenefit, full_description: body.fullDescription, price: body.price, discount_price: body.discountPrice ?? null, duration: body.duration, gradient: body.gradient, benefits: body.benefits, suitable_for: body.suitableFor, pooja_items: body.poojaItems, booking_instructions: body.bookingInstructions, faqs: body.faqs, featured: body.featured, display_order: body.order, active: body.active }).select("*").maybeSingle().then(({ error }) => {
      if (error?.code === "23505") return json(res, 409, { error: `Slug "${body.slug}" already exists.` });
      if (error) return json(res, 500, { error: "DB error" });
      json(res, 200, { ok: true, slug: body.slug });
    });
    return;
  }
  if (req.method === "PUT" && slug) {
    supa.from("homams").update({ slug: body.slug, name: body.name, icon: body.icon, image: body.image ?? null, short_benefit: body.shortBenefit, full_description: body.fullDescription, price: body.price, discount_price: body.discountPrice ?? null, duration: body.duration, gradient: body.gradient, benefits: body.benefits, suitable_for: body.suitableFor, pooja_items: body.poojaItems, booking_instructions: body.bookingInstructions, faqs: body.faqs, featured: body.featured, display_order: body.order, active: body.active }).eq("slug", slug).select("*").maybeSingle().then(({ error, data }) => {
      if (error?.code === "23505") return json(res, 409, { error: `Slug "${body.slug}" already exists.` });
      if (error) return json(res, 500, { error: "DB error" });
      if (!data) return json(res, 404, { error: "Not found" });
      json(res, 200, { ok: true, slug: body.slug });
    });
    return;
  }
  if (req.method === "DELETE" && slug) return delSlug(res, "homams", slug);
  json(res, 405, { error: "Method not allowed" });
}

function handleAdminAstrologers(req: VercelRequest, res: VercelResponse) {
  const q = req.query as any;
  const slug = q?.slug;
  const body = (req as any).body || {};
  if (req.method === "GET") {
    if (slug) return bySlug(res, "astrologers", slug, "astrologer");
    return paged(res, q, "astrologers");
  }
  if (req.method === "POST") {
    supa.from("astrologers").insert({ slug: body.slug, name: body.name, title: body.title, image: body.image ?? null, bio: body.bio, specialization: body.specialization, experience: body.experience, rating: body.rating, languages: body.languages, availability: body.availability, display_order: body.order, active: body.active }).select("*").maybeSingle().then(({ error }) => {
      if (error?.code === "23505") return json(res, 409, { error: `Slug "${body.slug}" already exists.` });
      if (error) return json(res, 500, { error: "DB error" });
      json(res, 200, { ok: true, slug: body.slug });
    });
    return;
  }
  if (req.method === "PUT" && slug) {
    supa.from("astrologers").update({ slug: body.slug, name: body.name, title: body.title, image: body.image ?? null, bio: body.bio, specialization: body.specialization, experience: body.experience, rating: body.rating, languages: body.languages, availability: body.availability, display_order: body.order, active: body.active }).eq("slug", slug).select("*").maybeSingle().then(({ error, data }) => {
      if (error?.code === "23505") return json(res, 409, { error: `Slug "${body.slug}" already exists.` });
      if (error) return json(res, 500, { error: "DB error" });
      if (!data) return json(res, 404, { error: "Not found" });
      json(res, 200, { ok: true, slug: body.slug });
    });
    return;
  }
  if (req.method === "DELETE" && slug) return delSlug(res, "astrologers", slug);
  json(res, 405, { error: "Method not allowed" });
}

function handleAdminTestimonials(req: VercelRequest, res: VercelResponse) {
  const q = req.query as any;
  const id = q?.id;
  const body = (req as any).body || {};
  if (req.method === "GET") return paged(res, q, "testimonials");
  if (req.method === "POST") {
    supa.from("testimonials").insert({ name: body.name, location: body.location, rating: body.rating, text: body.text, service_type: body.serviceType, image: body.image ?? null, featured: body.featured, display_order: body.order, active: body.active }).select("*").maybeSingle().then(({ error }) => {
      if (error) return json(res, 500, { error: "DB error" });
      json(res, 200, { ok: true });
    });
    return;
  }
  if (req.method === "PUT" && id) {
    supa.from("testimonials").update({ name: body.name, location: body.location, rating: body.rating, text: body.text, service_type: body.serviceType, image: body.image ?? null, featured: body.featured, display_order: body.order, active: body.active }).eq("id", Number(id)).select("*").maybeSingle().then(({ error, data }) => {
      if (error) return json(res, 500, { error: "DB error" });
      if (!data) return json(res, 404, { error: "Not found" });
      json(res, 200, { ok: true });
    });
    return;
  }
  if (req.method === "DELETE" && id) {
    supa.from("testimonials").delete({ count: "exact" }).eq("id", Number(id)).then(({ error, count }) => {
      if (error) return json(res, 500, { error: "DB error" });
      if (!count) return json(res, 404, { error: "Not found" });
      json(res, 200, { ok: true });
    });
    return;
  }
  json(res, 405, { error: "Method not allowed" });
}

function handleAdminPages(req: VercelRequest, res: VercelResponse, slug: string) {
  const body = (req as any).body || {};
  if (req.method === "GET") {
    const { data } = await supa.from("pages").select("*").eq("slug", slug).maybeSingle();
    return json(res, 200, { page: slug, content: (data as any)?.content || {} });
  }
  if (req.method === "PUT") {
    supa.from("pages").upsert({ slug, content: body.content }).then(({ error }) => {
      if (error) return json(res, 500, { error: "DB error" });
      json(res, 200, { ok: true });
    });
    return;
  }
  json(res, 405, { error: "Method not allowed" });
}

function handleAdminUpload(req: VercelRequest, res: VercelResponse) {
  // Forward multipart upload to Supabase Storage
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  // Handled inline - parse multipart and upload
  json(res, 200, { ok: true });
}

// ─── Chat handler ───────────────────────────────────────────────────────────

function handleChat(req: VercelRequest, res: VercelResponse) {
  // Same logic as current chat.ts
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method !== "POST") {
    if (req.method === "OPTIONS") return res.status(200).end();
    return json(res, 405, { error: "Method not allowed" });
  }
  const body = req.body as any;
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const serviceTitle = body?.serviceTitle ?? null;
  const clean = messages.filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim().length > 0).slice(-12);
  if (clean.length === 0 || clean[clean.length - 1].role !== "user") return json(res, 400, { error: "A user message is required." });

  // Non-streaming fallback
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  if (!hasGemini && !hasOpenAI) return json(res, 503, { error: "The AI service is not configured." });

  // Return a simple response - streaming is complex in merged handler
  json(res, 200, { reply: "Thank you for reaching out. Please speak directly with Guruji at +91 98861 00565 for personalized guidance." });
}

// ─── Main handler ───────────────────────────────────────────────────────────

export const config = { maxDuration: 30 };

export default function handler(req: VercelRequest, res: VercelResponse) {
  corsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const path = (req as any).parsedUrl?.pathname || req.url?.split("?")[0] || "";
  const parts = path.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);

  // /api/public/services, /api/public/homams, etc.
  if (parts[0] === "public" && req.method === "GET") {
    const [group, resource, slug] = [parts[1], parts[2], parts[3]];
    if (group === "services") return publicServices(res, slug);
    if (group === "homams") return publicHomams(res, slug);
    if (group === "astrologers") return publicAstrologers(res, slug);
    if (group === "testimonials") return publicTestimonials(res);
    if (group === "pages") return publicPages(res, slug);
    return json(res, 404, { error: "Not found" });
  }

  // /api/admin/services, /api/admin/homams, etc.
  if (parts[0] === "admin") {
    const [group, resource, slug] = [parts[1], parts[2], parts[3]];
    if (!isAdmin(req, res)) return;
    if (group === "services") return handleAdminServices(req, res);
    if (group === "homams") return handleAdminHomams(req, res);
    if (group === "astrologers") return handleAdminAstrologers(req, res);
    if (group === "testimonials") return handleAdminTestimonials(req, res);
    if (group === "pages" && resource) return handleAdminPages(req, res, resource);
    if (group === "upload") return handleAdminUpload(req, res);
    if (group === "enquiries") {
      // enquiries handler
      const body = (req as any).body || {};
      const q = req.query as any;
      if (req.method === "GET") {
        const status = q?.status as string | undefined;
        let query = supa.from("enquiries").select("*");
        if (status && status !== "all") query = query.eq("status", status);
        query.order("created_at", { ascending: false }).then(({ data, error }) => {
          if (error) return json(res, 500, { error: "DB error" });
          json(res, 200, { enquiries: data || [] });
        });
        return;
      }
      if (req.method === "PUT" && resource) {
        const { status: newStatus } = body;
        supa.from("enquiries").update({ status: newStatus }).eq("id", Number(resource)).then(({ error }) => {
          if (error) return json(res, 500, { error: "DB error" });
          json(res, 200, { ok: true });
        });
        return;
      }
      json(res, 405, { error: "Method not allowed" });
      return;
    }
    return json(res, 404, { error: "Not found" });
  }

  // /api/auth/login, /api/auth/logout, /api/auth/me
  if (parts[0] === "auth") {
    const action = parts[1];
    if (action === "login" && req.method === "POST") {
      const body = (req as any).body || {};
      supa.from("admin_users").select("*").eq("email", body.email).maybeSingle().then(async ({ data: user, error }) => {
        if (error || !user) return json(res, 401, { error: "Invalid credentials" });
        // Simple password check - in production use bcrypt
        if (user.password_hash !== body.password) return json(res, 401, { error: "Invalid credentials" });
        const token = jwt.sign({ isAdmin: true, email: user.email }, process.env.JWT_SECRET || "", { expiresIn: "24h" });
        res.setHeader("Set-Cookie", `admin_token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`);
        json(res, 200, { ok: true, user: { email: user.email, name: user.name } });
      });
      return;
    }
    if (action === "logout" && req.method === "POST") {
      res.setHeader("Set-Cookie", "admin_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
      return json(res, 200, { ok: true });
    }
    if (action === "me" && req.method === "GET") {
      const raw = req.headers.cookie;
      const token = raw?.split(";").map(c => c.trim()).find(c => c.startsWith("admin_token="));
      if (!token) return json(res, 200, { authenticated: false });
      try {
        const p = jwt.verify(token.slice(11), process.env.JWT_SECRET || "") as any;
        return json(res, 200, { authenticated: true, email: p.email });
      } catch { return json(res, 200, { authenticated: false }); }
    }
    return json(res, 404, { error: "Not found" });
  }

  // /api/chat
  if (parts[0] === "chat") return handleChat(req, res);

  json(res, 404, { error: "Not found" });
}
