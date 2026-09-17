import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supa = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ""
);

const corsHeaders = (res: VercelResponse) => {
  const origin = process.env.VITE_SITE_URL || "*";
  res.setHeader("Access-Control-Allow-Origin", origin === "*" ? "*" : origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (origin !== "*") res.setHeader("Access-Control-Allow-Credentials", "true");
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

async function publicAstrologers(res: VercelResponse) {
  const { data } = await supa.from("astrologers").select("*").eq("active", true).order("display_order", { ascending: true });
  return json(res, 200, { astrologers: data || [] });
}

async function publicTestimonials(res: VercelResponse) {
  const { data } = await supa.from("testimonials").select("*").eq("active", true).order("display_order", { ascending: true });
  return json(res, 200, { testimonials: data || [] });
}

async function publicPages(res: VercelResponse, slug?: string) {
  if (!slug) return json(res, 400, { error: "Slug required" });
  const { data } = await supa.from("pages").select("*").eq("slug", slug).maybeSingle();
  if (!data) return json(res, 404, { error: "Not found" });
  return json(res, 200, { page: data });
}

// ─── Admin CRUD handlers ────────────────────────────────────────────────────

function isAdmin(req: VercelRequest, res: VercelResponse): boolean {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) { json(res, 401, { error: "Unauthorized" }); return false; }
  try { jwt.verify(token, process.env.JWT_SECRET || ""); }
  catch { json(res, 401, { error: "Invalid session" }); return false; }
  return true;
}

function handleAdminServices(req: VercelRequest, res: VercelResponse, slug?: string) {
  if (req.method === "GET") {
    if (slug) {
      supa.from("services").select("*").eq("slug", slug).maybeSingle().then(({ data }) => {
        if (!data) return json(res, 404, { error: "Not found" });
        json(res, 200, { service: data });
      });
      return;
    }
    supa.from("services").select("*").order("display_order", { ascending: true }).then(({ data }) => {
      json(res, 200, { services: data || [] });
    });
    return;
  }
  if (req.method === "POST") {
    const svc = (req as any).body;
    supa.from("services").insert(svc).select().single().then(({ data }) => json(res, 201, { service: data }));
    return;
  }
  if (req.method === "PUT" && slug) {
    const updates = (req as any).body;
    supa.from("services").update(updates).eq("slug", slug).select().single().then(({ data }) => json(res, 200, { service: data }));
    return;
  }
  if (req.method === "DELETE" && slug) {
    supa.from("services").delete().eq("slug", slug).then(() => json(res, 200, { ok: true }));
    return;
  }
  json(res, 405, { error: "Method not allowed" });
}

function handleAdminHomams(req: VercelRequest, res: VercelResponse, slug?: string) {
  if (req.method === "GET") {
    if (slug) {
      supa.from("homams").select("*").eq("slug", slug).maybeSingle().then(({ data }) => {
        if (!data) return json(res, 404, { error: "Not found" });
        json(res, 200, { homam: data });
      });
      return;
    }
    supa.from("homams").select("*").order("display_order", { ascending: true }).then(({ data }) => {
      json(res, 200, { homams: data || [] });
    });
    return;
  }
  if (req.method === "POST") {
    const item = (req as any).body;
    supa.from("homams").insert(item).select().single().then(({ data }) => json(res, 201, { homam: data }));
    return;
  }
  if (req.method === "PUT" && slug) {
    const updates = (req as any).body;
    supa.from("homams").update(updates).eq("slug", slug).select().single().then(({ data }) => json(res, 200, { homam: data }));
    return;
  }
  if (req.method === "DELETE" && slug) {
    supa.from("homams").delete().eq("slug", slug).then(() => json(res, 200, { ok: true }));
    return;
  }
  json(res, 405, { error: "Method not allowed" });
}

function handleAdminAstrologers(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    supa.from("astrologers").select("*").order("display_order", { ascending: true }).then(({ data }) => {
      json(res, 200, { astrologers: data || [] });
    });
    return;
  }
  if (req.method === "POST") {
    const item = (req as any).body;
    supa.from("astrologers").insert(item).select().single().then(({ data }) => json(res, 201, { astrologer: data }));
    return;
  }
  if (req.method === "PUT") {
    const { id, ...updates } = (req as any).body;
    if (!id) return json(res, 400, { error: "ID required" });
    supa.from("astrologers").update(updates).eq("id", id).select().single().then(({ data }) => json(res, 200, { astrologer: data }));
    return;
  }
  if (req.method === "DELETE") {
    const { id } = (req as any).body;
    supa.from("astrologers").delete().eq("id", id).then(() => json(res, 200, { ok: true }));
    return;
  }
  json(res, 405, { error: "Method not allowed" });
}

function handleAdminTestimonials(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    supa.from("testimonials").select("*").order("display_order", { ascending: true }).then(({ data }) => {
      json(res, 200, { testimonials: data || [] });
    });
    return;
  }
  if (req.method === "POST") {
    const item = (req as any).body;
    supa.from("testimonials").insert(item).select().single().then(({ data }) => json(res, 201, { testimonial: data }));
    return;
  }
  if (req.method === "PUT") {
    const { id, ...updates } = (req as any).body;
    if (!id) return json(res, 400, { error: "ID required" });
    supa.from("testimonials").update(updates).eq("id", id).select().single().then(({ data }) => json(res, 200, { testimonial: data }));
    return;
  }
  if (req.method === "DELETE") {
    const { id } = (req as any).body;
    supa.from("testimonials").delete().eq("id", id).then(() => json(res, 200, { ok: true }));
    return;
  }
  json(res, 405, { error: "Method not allowed" });
}

function handleAdminPages(req: VercelRequest, res: VercelResponse, slug: string) {
  if (req.method === "GET") {
    supa.from("pages").select("*").eq("slug", slug).maybeSingle().then(({ data }) => {
      if (!data) return json(res, 404, { error: "Not found" });
      json(res, 200, { page: data });
    });
    return;
  }
  if (req.method === "PUT") {
    const updates = (req as any).body;
    supa.from("pages").update(updates).eq("slug", slug).select().single().then(({ data }) => json(res, 200, { page: data }));
    return;
  }
  json(res, 405, { error: "Method not allowed" });
}

function handleAdminUpload(req: VercelRequest, res: VercelResponse) {
  json(res, 501, { error: "Upload not implemented" });
}

// ─── Chat handler ───────────────────────────────────────────────────────────

function handleChat(req: VercelRequest, res: VercelResponse) {
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

  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  if (!hasGemini && !hasOpenAI) return json(res, 503, { error: "The AI service is not configured." });

  json(res, 200, { reply: "Thank you for reaching out. Please speak directly with Guruji at +91 98861 00565 for personalized guidance." });
}

// ─── Auth handler ───────────────────────────────────────────────────────────

function handleAuth(req: VercelRequest, res: VercelResponse) {
  const pathArr = (req.query as any).path || [];
  const parts = Array.isArray(pathArr)
    ? pathArr.filter(Boolean)
    : String(pathArr).split("/").filter(Boolean);
  const action = parts[0];

  if (action === "login" && req.method === "POST") {
    const body = (req as any).body || {};
    const email = body.email || "";
    const password = body.password || "";
    if (!email || !password) return json(res, 400, { error: "Email and password required" });
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return json(res, 401, { error: "Invalid credentials" });
    const secret = process.env.JWT_SECRET || "fallback";
    const token = jwt.sign({ isAdmin: true, email }, secret, { expiresIn: "24h" });
    return json(res, 200, { ok: true, token, user: { email } });
  }

  if (action === "logout" && req.method === "POST") {
    return json(res, 200, { ok: true });
  }

  if (action === "me" && req.method === "GET") {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return json(res, 200, { authenticated: false });
    try {
      const p = jwt.verify(token, process.env.JWT_SECRET || "") as any;
      return json(res, 200, { authenticated: true, email: p.email });
    } catch {
      return json(res, 200, { authenticated: false });
    }
  }

  return json(res, 404, { error: "Not found" });
}

// ─── Main handler ───────────────────────────────────────────────────────────

export const config = { maxDuration: 30 };

export default function handler(req: VercelRequest, res: VercelResponse) {
  corsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const pathArr = (req.query as any).path || [];
  const parts = Array.isArray(pathArr)
    ? pathArr.filter(Boolean)
    : String(pathArr).split("/").filter(Boolean);

  // /api/public/services, /api/public/homams, etc.
  if (parts[0] === "public" && req.method === "GET") {
    const [group, resource, slug] = [parts[1], parts[2], parts[3]];
    if (group === "services") return publicServices(res, slug);
    if (group === "homams") return publicHomams(res, slug);
    if (group === "astrologers") return publicAstrologers(res);
    if (group === "testimonials") return publicTestimonials(res);
    if (group === "pages") return publicPages(res, slug);
    return json(res, 404, { error: "Not found" });
  }

  // /api/admin/services, /api/admin/homams, etc.
  if (parts[0] === "admin") {
    const group = parts[1];
    const slug = parts[2];
    if (!isAdmin(req, res)) return;
    if (group === "services") return handleAdminServices(req, res, slug);
    if (group === "homams") return handleAdminHomams(req, res, slug);
    if (group === "astrologers") return handleAdminAstrologers(req, res);
    if (group === "testimonials") return handleAdminTestimonials(req, res);
    if (group === "pages" && slug) return handleAdminPages(req, res, slug);
    if (group === "upload") return handleAdminUpload(req, res);
    return json(res, 404, { error: "Not found" });
  }

  // /api/auth/login, /api/auth/logout, /api/auth/me
  if (parts[0] === "auth") return handleAuth(req, res);

  // /api/chat
  if (parts[0] === "chat") return handleChat(req, res);

  // /api/enquiries, /api/contact, /api/orders
  if (parts[0] === "enquiries" && req.method === "POST") {
    const enquiry = (req as any).body || {};
    supa.from("enquiries").insert(enquiry).select().single().then(({ data }) => json(res, 201, { enquiry: data }));
    return;
  }
  if (parts[0] === "contact" && req.method === "POST") {
    const contact = (req as any).body || {};
    supa.from("contacts").insert(contact).select().single().then(({ data }) => json(res, 201, { contact: data }));
    return;
  }
  if (parts[0] === "orders" && req.method === "POST") {
    const order = (req as any).body || {};
    supa.from("orders").insert(order).select().single().then(({ data }) => json(res, 201, { order: data }));
    return;
  }

  json(res, 404, { error: "Not found" });
}
