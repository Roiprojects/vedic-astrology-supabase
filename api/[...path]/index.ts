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

function json(res: VercelResponse, data: any, status = 200) { res.status(status).json(data); }

function corsHeaders(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function adminOnly(req: VercelRequest, res: VercelResponse): boolean {
  const token = getCookie(req, "admin_token");
  if (!token || !JWT_SECRET) { json(res, { error: "Unauthorized" }, 401); return false; }
  try { const p = jwt.verify(token, JWT_SECRET) as { isAdmin: boolean }; if (!p.isAdmin) { json(res, { error: "Forbidden" }, 403); return false; } }
  catch { json(res, { error: "Invalid or expired session" }, 401); return false; }
  return true;
}

const ALLOWED_PAGES = new Set(["birth-chart-pdf", "chat-with-guruji", "palm-reading"]);

// --- Admin handlers ---

async function handleAdminServices(req: VercelRequest, res: VercelResponse, parts: string[]) {
  const slug = parts[2];
  if (req.method === "GET" && slug) {
    const { data, error } = await supa.from("services").select("*").eq("slug", slug).maybeSingle();
    if (error || !data) return json(res, { error: "Not found" }, 404);
    return json(res, { service: data });
  }
  if (req.method === "PUT" && slug) {
    if (!adminOnly(req, res)) return;
    const body = (req as any).body || {};
    const { data, error } = await supa.from("services").update({
      slug: body.slug, title: body.title, category_slug: body.categorySlug || "astrology-consultations",
      icon: body.icon, image: body.image ?? null, short_description: body.shortDescription,
      full_description: body.fullDescription, problem: body.problem, price: body.price,
      discount_price: body.discountPrice ?? null, duration: body.duration, gradient: body.gradient,
      analysis: body.analysis, receive: body.receive, benefits: body.benefits, remedies: body.remedies,
      faqs: body.faqs, featured: body.featured, display_order: body.order, active: body.active,
    }).eq("slug", slug).select("*").maybeSingle();
    if (error) { if (error.code === "23505") return json(res, { error: `Slug "${body.slug}" already exists.` }, 409); return json(res, { error: "DB error" }, 500); }
    if (!data) return json(res, { error: "Not found" }, 404);
    return json(res, { ok: true, slug: body.slug });
  }
  if (req.method === "DELETE" && slug) {
    if (!adminOnly(req, res)) return;
    const { count } = await supa.from("services").delete({ count: "exact" }).eq("slug", slug);
    if (!count) return json(res, { error: "Not found" }, 404);
    return json(res, { ok: true });
  }
  if (req.method === "GET") {
    const { data, error } = await supa.from("services").select("*").order("display_order", { ascending: true }).order("title", { ascending: true });
    if (error) return json(res, { error: "DB error" }, 500);
    return json(res, { services: data || [] });
  }
  if (req.method === "POST") {
    if (!adminOnly(req, res)) return;
    const body = (req as any).body || {};
    const { error, data } = await supa.from("services").insert({
      slug: body.slug, title: body.title, category_slug: body.categorySlug || "astrology-consultations",
      icon: body.icon, image: body.image ?? null, short_description: body.shortDescription,
      full_description: body.fullDescription, problem: body.problem, price: body.price,
      discount_price: body.discountPrice ?? null, duration: body.duration, gradient: body.gradient,
      analysis: body.analysis, receive: body.receive, benefits: body.benefits, remedies: body.remedies,
      faqs: body.faqs, featured: body.featured, display_order: body.order, active: body.active,
    }).select("*").maybeSingle();
    if (error) { if (error.code === "23505") return json(res, { error: `Slug "${body.slug}" already exists.` }, 409); return json(res, { error: "DB error" }, 500); }
    return json(res, { ok: true, slug: body.slug });
  }
  return json(res, { error: "Method not allowed" }, 405);
}

async function handleAdminHomams(req: VercelRequest, res: VercelResponse, parts: string[]) {
  const slug = parts[2];
  if (req.method === "GET" && slug) {
    const { data, error } = await supa.from("homams").select("*").eq("slug", slug).maybeSingle();
    if (error || !data) return json(res, { error: "Not found" }, 404);
    return json(res, { homam: data });
  }
  if (req.method === "PUT" && slug) {
    if (!adminOnly(req, res)) return;
    const body = (req as any).body || {};
    const { data, error } = await supa.from("homams").update({
      slug: body.slug, name: body.name, icon: body.icon, image: body.image ?? null,
      short_benefit: body.shortBenefit, full_description: body.fullDescription,
      price: body.price, discount_price: body.discountPrice ?? null, duration: body.duration,
      gradient: body.gradient, benefits: body.benefits, suitable_for: body.suitableFor,
      pooja_items: body.poojaItems, booking_instructions: body.bookingInstructions,
      faqs: body.faqs, featured: body.featured, display_order: body.order, active: body.active,
    }).eq("slug", slug).select("*").maybeSingle();
    if (error) { if (error.code === "23505") return json(res, { error: `Slug "${body.slug}" already exists.` }, 409); return json(res, { error: "DB error" }, 500); }
    if (!data) return json(res, { error: "Not found" }, 404);
    return json(res, { ok: true, slug: body.slug });
  }
  if (req.method === "DELETE" && slug) {
    if (!adminOnly(req, res)) return;
    const { count } = await supa.from("homams").delete({ count: "exact" }).eq("slug", slug);
    if (!count) return json(res, { error: "Not found" }, 404);
    return json(res, { ok: true });
  }
  if (req.method === "GET") {
    const { data, error } = await supa.from("homams").select("*").order("display_order", { ascending: true }).order("name", { ascending: true });
    if (error) return json(res, { error: "DB error" }, 500);
    return json(res, { homams: data || [] });
  }
  if (req.method === "POST") {
    if (!adminOnly(req, res)) return;
    const body = (req as any).body || {};
    const { error, data } = await supa.from("homams").insert({
      slug: body.slug, name: body.name, icon: body.icon, image: body.image ?? null,
      short_benefit: body.shortBenefit, full_description: body.fullDescription,
      price: body.price, discount_price: body.discountPrice ?? null, duration: body.duration,
      gradient: body.gradient, benefits: body.benefits, suitable_for: body.suitableFor,
      pooja_items: body.poojaItems, booking_instructions: body.bookingInstructions,
      faqs: body.faqs, featured: body.featured, display_order: body.order, active: body.active,
    }).select("*").maybeSingle();
    if (error) { if (error.code === "23505") return json(res, { error: `Slug "${body.slug}" already exists.` }, 409); return json(res, { error: "DB error" }, 500); }
    return json(res, { ok: true, slug: body.slug });
  }
  return json(res, { error: "Method not allowed" }, 405);
}

async function handleAdminAstrologers(req: VercelRequest, res: VercelResponse, parts: string[]) {
  const slug = parts[2];
  if (req.method === "GET" && slug) {
    const { data, error } = await supa.from("astrologers").select("*").eq("slug", slug).maybeSingle();
    if (error || !data) return json(res, { error: "Not found" }, 404);
    return json(res, { astrologer: data });
  }
  if (req.method === "PUT" && slug) {
    if (!adminOnly(req, res)) return;
    const body = (req as any).body || {};
    const { data, error } = await supa.from("astrologers").update({
      slug: body.slug, name: body.name, title: body.title || "", image: body.image ?? null,
      verified: !!body.verified, online: !!body.online, rating: body.rating ?? 4.5,
      reviews: body.reviews ?? 0, experience_years: body.experienceYears ?? 0,
      languages: body.languages || [], specialties: body.specialties || [],
      price_chat: body.priceChat ?? 0, price_call: body.priceCall ?? 0,
      about: body.about || "", service_slug: body.serviceSlug ?? null,
      featured: !!body.featured, display_order: body.order ?? 0, active: body.active ?? true,
    }).eq("slug", slug).select("*").maybeSingle();
    if (error) { if (error.code === "23505") return json(res, { error: `Slug "${body.slug}" already exists.` }, 409); return json(res, { error: "DB error" }, 500); }
    if (!data) return json(res, { error: "Not found" }, 404);
    return json(res, { ok: true });
  }
  if (req.method === "DELETE" && slug) {
    if (!adminOnly(req, res)) return;
    const { count } = await supa.from("astrologers").delete({ count: "exact" }).eq("slug", slug);
    if (!count) return json(res, { error: "Not found" }, 404);
    return json(res, { ok: true });
  }
  if (req.method === "GET") {
    const { data, error } = await supa.from("astrologers").select("*").order("display_order", { ascending: true }).order("name", { ascending: true });
    if (error) return json(res, { error: "DB error" }, 500);
    return json(res, { astrologers: data || [] });
  }
  if (req.method === "POST") {
    if (!adminOnly(req, res)) return;
    const body = (req as any).body || {};
    const { error, data } = await supa.from("astrologers").insert({
      slug: body.slug, name: body.name, title: body.title || "", image: body.image ?? null,
      verified: !!body.verified, online: !!body.online, rating: body.rating ?? 4.5,
      reviews: body.reviews ?? 0, experience_years: body.experienceYears ?? 0,
      languages: body.languages || [], specialties: body.specialties || [],
      price_chat: body.priceChat ?? 0, price_call: body.priceCall ?? 0,
      about: body.about || "", service_slug: body.serviceSlug ?? null,
      featured: !!body.featured, display_order: body.order ?? 0, active: body.active ?? true,
    }).select("*").maybeSingle();
    if (error) { if (error.code === "23505") return json(res, { error: `Slug "${body.slug}" already exists.` }, 409); return json(res, { error: "DB error" }, 500); }
    return json(res, { ok: true, astrologer: data });
  }
  if (slug === "seed" && req.method === "POST") {
    if (!adminOnly(req, res)) return;
    const seed = [
      { slug: "guruji", name: "Guruji", title: "Founder • Vedic Master", image: "/images/rishi-guruji.svg", verified: true, online: true, rating: 4.9, reviews: 1280, experience_years: 25, languages: ["English","Kannada","Hindi","Telugu"], specialties: ["Vedic Astrology","Marriage","Career","Relationship"], price_chat: 2000, price_call: 2500, about: "Authentic Vedic guidance.", service_slug: "janna-jataka-comprehensive-birth-chart", featured: true, display_order: 0, active: true },
      { slug: "vedic-relationship", name: "Acharya Meera", title: "Relationship & Compatibility", image: "/images/rishi-guruji.svg", verified: true, online: true, rating: 4.8, reviews: 640, experience_years: 14, languages: ["English","Hindi"], specialties: ["Relationship","Marriage"], price_chat: 1800, price_call: 2200, about: "Specialises in Venus.", service_slug: "love-relationship-problems", featured: false, display_order: 1, active: true },
      { slug: "career-guide", name: "Pandit Arjun Rao", title: "Career & Dasha Timing", image: "/images/rishi-guruji.svg", verified: true, online: false, rating: 4.7, reviews: 410, experience_years: 18, languages: ["English","Kannada","Tamil"], specialties: ["Career","Finance"], price_chat: 1600, price_call: 2100, about: "10th-house strength.", service_slug: "career-confusion-job-problems", featured: false, display_order: 2, active: true },
      { slug: "palm-vastu", name: "Smt. Lakshmi Sharma", title: "Palmistry & Vastu", image: "/images/rishi-guruji.svg", verified: true, online: true, rating: 4.6, reviews: 290, experience_years: 12, languages: ["English","Hindi","Marathi"], specialties: ["Palmistry","Vastu"], price_chat: 1200, price_call: 1600, about: "Five major lines.", service_slug: null, featured: false, display_order: 3, active: true },
      { slug: "kp-timing", name: "Prof. Nikhil Iyer", title: "KP Astrology & Muhurat", image: "/images/rishi-guruji.svg", verified: true, online: true, rating: 4.8, reviews: 355, experience_years: 16, languages: ["English","Malayalam"], specialties: ["KP Astrology","Career"], price_chat: 1900, price_call: 2400, about: "Krishnamurti Paddhati.", service_slug: "janna-jataka-comprehensive-birth-chart", featured: false, display_order: 4, active: true },
    ];
    for (const a of seed) await supa.from("astrologers").upsert({ ...a, onConflict: "slug" });
    return json(res, { ok: true, message: `Seeded ${seed.length} astrologers` });
  }
  return json(res, { error: "Method not allowed" }, 405);
}

async function handleAdminEnquiries(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const q = (req.query as any) || {};
    let query = supa.from("enquiries").select("*").order("created_at", { ascending: false }).limit(200);
    if (q.status) query = query.eq("status", q.status);
    const { data, error } = await query;
    if (error) return json(res, { error: "DB error" }, 500);
    return json(res, { enquiries: data || [] });
  }
  if (req.method === "PUT") {
    if (!adminOnly(req, res)) return;
    const parts = (req.url || "/").split("?")[0].split("/").filter(Boolean);
    const id = parts[3];
    const { status } = (req as any).body || {};
    if (!status) return json(res, { error: "status required" }, 400);
    const { data, error } = await supa.from("enquiries").update({ status, updated_at: new Date().toISOString() }).eq("id", id).select("*").maybeSingle();
    if (error || !data) return json(res, { error: "Not found" }, 404);
    return json(res, { ok: true });
  }
  return json(res, { error: "Method not allowed" }, 405);
}

async function handleAdminPages(req: VercelRequest, res: VercelResponse, parts: string[]) {
  if (parts.length < 3) return json(res, { error: "Not found" }, 404);
  const page = parts[2];
  if (!ALLOWED_PAGES.has(page)) return json(res, { error: "Unknown page." }, 404);
  if (req.method === "GET") {
    const { data } = await supa.from("pages").select("content").eq("slug", page).maybeSingle();
    return json(res, { page, content: data?.content ?? {} });
  }
  if (req.method === "PUT") {
    if (!adminOnly(req, res)) return;
    const body = (req as any).body || {};
    const content = { ...body, price: body.price ?? null };
    const { error } = await supa.from("pages").upsert({ slug: page, title: content.title ?? page, content, active: true }, { onConflict: "slug" });
    if (error) return json(res, { error: "DB error" }, 500);
    return json(res, { ok: true });
  }
  return json(res, { error: "Method not allowed" }, 405);
}

async function handleAdminTestimonials(req: VercelRequest, res: VercelResponse, parts: string[]) {
  const id = parts[2];
  if (req.method === "GET") {
    const { data, error } = await supa.from("testimonials").select("*").order("display_order", { ascending: true }).order("date", { ascending: false });
    if (error) return json(res, { error: "DB error" }, 500);
    return json(res, { testimonials: data || [] });
  }
  if (req.method === "POST") {
    if (!adminOnly(req, res)) return;
    const body = (req as any).body || {};
    const { error, data } = await supa.from("testimonials").insert({
      name: body.name, location: body.location || "", rating: body.rating ?? 5,
      service_type: body.serviceType || "all", text: body.text,
      date: body.date || new Date().toISOString().slice(0, 10),
      avatar_initial: (body.avatarInitial || body.name?.[0] || "G").slice(0, 2),
      featured: !!body.featured, display_order: body.displayOrder ?? 0, active: body.active ?? true,
    }).select("*").maybeSingle();
    if (error) return json(res, { error: "DB error" }, 500);
    return json(res, { ok: true, testimonial: data });
  }
  if (req.method === "PUT" && id) {
    if (!adminOnly(req, res)) return;
    const body = (req as any).body || {};
    const { data, error } = await supa.from("testimonials").update({
      name: body.name, location: body.location || "", rating: body.rating ?? 5,
      service_type: body.serviceType || "all", text: body.text,
      date: body.date || new Date().toISOString().slice(0, 10),
      avatar_initial: (body.avatarInitial || body.name?.[0] || "G").slice(0, 2),
      featured: !!body.featured, display_order: body.displayOrder ?? 0, active: body.active ?? true,
    }).eq("id", id).select("*").maybeSingle();
    if (error) return json(res, { error: "DB error" }, 500);
    if (!data) return json(res, { error: "Not found" }, 404);
    return json(res, { ok: true });
  }
  if (req.method === "DELETE" && id) {
    if (!adminOnly(req, res)) return;
    const { count } = await supa.from("testimonials").delete({ count: "exact" }).eq("id", id);
    if (!count) return json(res, { error: "Not found" }, 404);
    return json(res, { ok: true });
  }
  return json(res, { error: "Method not allowed" }, 405);
}

// --- Upload handler ---

async function handleUpload(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const { data, error } = await supa.from("media_library").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) return json(res, { error: "DB error" }, 500);
    return json(res, { files: data || [] });
  }
  if (req.method === "POST") {
    if (!adminOnly(req, res)) return;
    const contentType = (req.headers["content-type"] as string) || "";
    if (!contentType.includes("multipart/form-data")) return json(res, { error: "Expected multipart/form-data" }, 400);
    const chunks: Buffer[] = [];
    for await (const chunk of (req as any)) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) return json(res, { error: "No boundary found" }, 400);
    const boundary = boundaryMatch[1];
    const parts = buffer.toString("binary").split("--" + boundary);
    let fileBuffer: Buffer | null = null;
    let filename = "", mimeType = "";
    for (const part of parts) {
      const headerEnd = part.indexOf("\r\n\r\n");
      if (headerEnd < 0) continue;
      const headers = part.slice(0, headerEnd);
      const body = part.slice(headerEnd + 4);
      if (headers.includes('name="file"')) {
        const fnMatch = headers.match(/filename="(.+?)"/);
        const typeMatch = headers.match(/Content-Type: (.+)/);
        filename = fnMatch ? fnMatch[1] : "upload";
        mimeType = typeMatch ? typeMatch[1].trim() : "application/octet-stream";
        const closingIdx = body.lastIndexOf("\r\n--");
        fileBuffer = Buffer.from(closingIdx >= 0 ? body.slice(0, closingIdx) : body, "binary");
      }
    }
    if (!fileBuffer || fileBuffer.length === 0) return json(res, { error: "No file uploaded" }, 400);
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(mimeType)) return json(res, { error: "Invalid file type" }, 400);
    if (fileBuffer.length > 10 * 1024 * 1024) return json(res, { error: "File too large" }, 400);
    const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")) : ".jpg";
    const storagePath = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const { error: uploadError } = await supa.storage.from("uploads").upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true });
    if (uploadError) return json(res, { error: "Upload failed" }, 500);
    const { data: urlData } = supa.storage.from("uploads").getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;
    let dbRow = null;
    try {
      const { data, error: dbError } = await supa.from("media_library").insert({
        filename: storagePath, original_name: filename, mime_type: mimeType,
        size_bytes: fileBuffer.length, url: publicUrl, alt_text: "",
      }).select("*").maybeSingle();
      if (!dbError) dbRow = data;
    } catch {}
    return json(res, { ok: true, url: publicUrl, file: dbRow || { url: publicUrl } });
  }
  return json(res, { error: "Method not allowed" }, 405);
}

// --- Public handlers ---

async function handlePublicServices(req: VercelRequest, res: VercelResponse, parts: string[]) {
  const q = (req.query as any) || {};
  if (parts.length >= 3 && parts[2] === "featured") {
    const limit = Number(q.limit) || 6;
    const { data, error } = await supa.from("services").select("*").eq("active", true).eq("featured", true).order("display_order", { ascending: true }).limit(limit);
    if (error) return json(res, { error: "DB error" }, 500);
    return json(res, { services: data || [] });
  }
  const slug = q.slug as string | undefined;
  if (slug) {
    const { data, error } = await supa.from("services").select("*").eq("slug", slug).eq("active", true).maybeSingle();
    if (error || !data) return json(res, { error: "Not found" }, 404);
    return json(res, { service: data });
  }
  const { data, error } = await supa.from("services").select("*").eq("active", true).order("display_order", { ascending: true });
  if (error) return json(res, { error: "DB error" }, 500);
  return json(res, { services: data || [] });
}

async function handlePublicHomams(req: VercelRequest, res: VercelResponse) {
  const q = (req.query as any) || {};
  const slug = q.slug as string | undefined;
  if (slug) {
    const { data, error } = await supa.from("homams").select("*").eq("slug", slug).eq("active", true).maybeSingle();
    if (error || !data) return json(res, { error: "Not found" }, 404);
    return json(res, { homam: data });
  }
  const { data, error } = await supa.from("homams").select("*").eq("active", true).order("display_order", { ascending: true });
  if (error) return json(res, { error: "DB error" }, 500);
  return json(res, { homams: data || [] });
}

async function handlePublicAstrologers(req: VercelRequest, res: VercelResponse) {
  const q = (req.query as any) || {};
  const slug = q.slug as string | undefined;
  if (slug) {
    const { data, error } = await supa.from("astrologers").select("*").eq("slug", slug).maybeSingle();
    if (error || !data) return json(res, { error: "Not found" }, 404);
    return json(res, { astrologer: data });
  }
  const { data, error } = await supa.from("astrologers").select("*").order("display_order", { ascending: true });
  if (error) return json(res, { error: "DB error" }, 500);
  return json(res, { astrologers: data || [] });
}

async function handlePublicPages(req: VercelRequest, res: VercelResponse, parts: string[]) {
  if (parts.length < 3) return json(res, { error: "Not found" }, 404);
  const page = parts[2];
  const { data } = await supa.from("pages").select("content").eq("slug", page).maybeSingle();
  return json(res, { page, content: data?.content ?? {} });
}

async function handlePublicTestimonials(req: VercelRequest, res: VercelResponse) {
  const { data, error } = await supa.from("testimonials").select("*").eq("active", true).order("display_order", { ascending: true });
  if (error) return json(res, { error: "DB error" }, 500);
  return json(res, { testimonials: data || [] });
}

// --- Main catch-all handler ---

export const config = { maxDuration: 30 };

export default function handler(req: VercelRequest, res: VercelResponse) {
  const pathArr = ((req as any).params?.path as string[]) || [];

  if (req.method === "OPTIONS") { corsHeaders(res); return res.status(200).end(); }

  // Auth routes
  if (pathArr[0] === "auth") {
    if (pathArr[1] === "login" && req.method === "POST") return (require("./auth/login") as any).default(req, res);
    if (pathArr[1] === "logout" && req.method === "POST") return (require("./auth/logout") as any).default(req, res);
    if (pathArr[1] === "me" && req.method === "GET") return (require("./auth/me") as any).default(req, res);
    return json(res, { error: "Not found" }, 404);
  }

  // Admin routes
  if (pathArr[0] === "admin") {
    corsHeaders(res);
    if (pathArr[1] === "services") return handleAdminServices(req, res, pathArr);
    if (pathArr[1] === "homams") return handleAdminHomams(req, res, pathArr);
    if (pathArr[1] === "astrologers") return handleAdminAstrologers(req, res, pathArr);
    if (pathArr[1] === "enquiries") return handleAdminEnquiries(req, res);
    if (pathArr[1] === "pages") return handleAdminPages(req, res, pathArr);
    if (pathArr[1] === "testimonials") return handleAdminTestimonials(req, res, pathArr);
    if (pathArr[1] === "upload") return handleUpload(req, res);
    return json(res, { error: "Not found" }, 404);
  }

  // Public routes
  if (pathArr[0] === "public") {
    corsHeaders(res);
    if (pathArr[1] === "services") return handlePublicServices(req, res, pathArr);
    if (pathArr[1] === "homams") return handlePublicHomams(req, res);
    if (pathArr[1] === "astrologers") return handlePublicAstrologers(req, res);
    if (pathArr[1] === "pages") return handlePublicPages(req, res, pathArr);
    if (pathArr[1] === "testimonials") return handlePublicTestimonials(req, res);
    return json(res, { error: "Not found" }, 404);
  }

  // Other routes (delegate to individual files)
  if (pathArr[0] === "chat") return (require("./chat") as any).default(req, res);
  if (pathArr[0] === "palm-reading") return (require("./palm-reading") as any).default(req, res);
  if (pathArr[0] === "enquiry") return (require("./enquiry") as any).default(req, res);
  if (pathArr[0] === "consultation" && pathArr[1] === "generate") return (require("./consultation/generate") as any).default(req, res);
  if (pathArr[0] === "user" && pathArr[1] === "me") return (require("./user/me") as any).default(req, res);
  if (pathArr[0] === "user" && pathArr[1] === "app-profile") return (require("./user/app-profile") as any).default(req, res);
  if (pathArr[0] === "user" && pathArr[1] === "send-otp") return (require("./user/send-otp") as any).default(req, res);
  if (pathArr[0] === "user" && pathArr[1] === "verify-otp") return (require("./user/verify-otp") as any).default(req, res);
  if (pathArr[0] === "razorpay" && pathArr[1] === "order") return (require("./razorpay/order") as any).default(req, res);
  if (pathArr[0] === "razorpay" && pathArr[1] === "verify") return (require("./razorpay/verify") as any).default(req, res);
  if (pathArr[0] === "subscriptions" && pathArr[1] === "plans") return (require("./subscriptions/plans") as any).default(req, res);
  if (pathArr[0] === "subscriptions" && pathArr[1] === "create") return (require("./subscriptions/create") as any).default(req, res);

  json(res, { error: "API route not found" }, 404);
}
