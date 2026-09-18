import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const supa = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ""
);

const corsHeaders = (res: VercelResponse, req: VercelRequest) => {
  const origin = (req.headers.origin as string) || process.env.VITE_SITE_URL || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
};

function json(res: VercelResponse, code: number, data: any) {
  res.status(code).setHeader("Content-Type", "application/json").json(data);
}

// ── Email helper ─────────────────────────────────────────────────────────────
let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter | null> {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const tlsServername = process.env.SMTP_TLS_SERVERNAME;
  if (!host || !user || !pass) return null;
  try {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: { user, pass },
      tls: tlsServername ? { servername: tlsServername } : undefined,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
    });
    return transporter;
  } catch {
    return null;
  }
}

async function sendEmailDirect(opts: { to: string; subject: string; html: string; text?: string }): Promise<void> {
  const t = await getTransporter();
  if (!t) {
    console.info("[api] SMTP not configured — email not sent:", opts.subject);
    return;
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@myvedicastrology.in";
  try {
    await t.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text || opts.html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
    });
    console.info("[api] email sent:", opts.subject, "->", opts.to);
  } catch (e) {
    console.error("[api] email failed:", e);
  }
}

// ─── camelCase → snake_case field mappers ───────────────────────────────────

function mapServiceBody(body: any) {
  return {
    slug: body.slug, title: body.title,
    category_slug: body.categorySlug ?? body.category_slug ?? "",
    icon: body.icon ?? "🔮", image: body.image ?? null,
    short_description: body.shortDescription ?? body.short_description ?? "",
    full_description: body.fullDescription ?? body.full_description ?? "",
    problem: body.problem ?? "", price: body.price ?? 0,
    discount_price: body.discountPrice ?? body.discount_price ?? null,
    duration: body.duration ?? "", gradient: body.gradient ?? "",
    analysis: body.analysis ?? [], receive: body.receive ?? [],
    benefits: body.benefits ?? [], remedies: body.remedies ?? [],
    faqs: body.faqs ?? [], featured: body.featured ?? false,
    display_order: body.order ?? body.display_order ?? 0, active: body.active ?? true,
  };
}

function mapHomamBody(body: any) {
  return {
    slug: body.slug, name: body.name, icon: body.icon ?? "🔥", image: body.image ?? null,
    short_benefit: body.shortBenefit ?? body.short_benefit ?? "",
    full_description: body.fullDescription ?? body.full_description ?? "",
    price: body.price ?? 0, discount_price: body.discountPrice ?? body.discount_price ?? null,
    duration: body.duration ?? "", gradient: body.gradient ?? "",
    benefits: body.benefits ?? [], suitable_for: body.suitableFor ?? body.suitable_for ?? "",
    pooja_items: body.poojaItems ?? body.pooja_items ?? "",
    booking_instructions: body.bookingInstructions ?? body.booking_instructions ?? "",
    faqs: body.faqs ?? [], featured: body.featured ?? false,
    display_order: body.order ?? body.display_order ?? 0, active: body.active ?? true,
  };
}

function mapAstrologerBody(body: any) {
  return {
    slug: body.slug, name: body.name, title: body.title ?? "", image: body.image ?? null,
    verified: body.verified ?? false, online: body.online ?? false,
    rating: body.rating ?? 0, reviews: body.reviews ?? 0,
    experience_years: body.experienceYears ?? body.experience_years ?? 0,
    languages: body.languages ?? [], specialties: body.specialties ?? [],
    price_chat: body.priceChat ?? body.price_chat ?? 0,
    price_call: body.priceCall ?? body.price_call ?? 0,
    about: body.about ?? "", service_slug: body.serviceSlug ?? body.service_slug ?? "",
    featured: body.featured ?? false,
    display_order: body.order ?? body.display_order ?? 0, active: body.active ?? true,
  };
}

function mapTestimonialBody(body: any) {
  return {
    name: body.name, location: body.location ?? "", rating: body.rating ?? 5,
    service_type: body.service_type ?? "", text: body.text ?? "",
    date: body.date ?? new Date().toISOString().split("T")[0],
    avatar_initial: body.avatar_initial ?? (body.name ? body.name[0] : "G"),
    featured: body.featured ?? false, display_order: body.display_order ?? 0, active: body.active ?? true,
  };
}

// ─── Public read-only handlers ──────────────────────────────────────────────

async function publicServices(res: VercelResponse, req: VercelRequest) {
  const parts = Array.isArray((req.query as any).path) ? (req.query as any).path.filter(Boolean) : String((req.query as any).path || "").split("/").filter(Boolean);
  const slug = parts[2] || undefined; // /api/public/services/featured?limit=3
  if (slug === "featured") {
    const limit = (req.query as any).limit ? Math.min(parseInt((req.query as any).limit, 10) || 0, 50) : 0;
    let query = supa.from("services").select("*").eq("active", true).eq("featured", true).order("display_order", { ascending: true });
    if (limit > 0) query = query.limit(limit);
    const { data } = await query;
    return json(res, 200, { services: data || [] });
  }
  if (slug) {
    const { data } = await supa.from("services").select("*").eq("slug", slug).eq("active", true).maybeSingle();
    if (!data) return json(res, 404, { error: "Not found" });
    return json(res, 200, { service: data });
  }
  const { data } = await supa.from("services").select("*").eq("active", true).order("display_order", { ascending: true });
  return json(res, 200, { services: data || [] });
}

async function publicHomams(res: VercelResponse, req: VercelRequest) {
  const parts = Array.isArray((req.query as any).path) ? (req.query as any).path.filter(Boolean) : String((req.query as any).path || "").split("/").filter(Boolean);
  const slug = parts[2] || undefined; // /api/public/homams/featured?limit=3
  if (slug === "featured") {
    const limit = (req.query as any).limit ? Math.min(parseInt((req.query as any).limit, 10) || 0, 50) : 0;
    let query = supa.from("homams").select("*").eq("active", true).eq("featured", true).order("display_order", { ascending: true });
    if (limit > 0) query = query.limit(limit);
    const { data } = await query;
    return json(res, 200, { homams: data || [] });
  }
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
    const mapped = mapServiceBody((req as any).body);
    supa.from("services").insert(mapped).select().single().then(({ data }) => json(res, 201, { service: data }));
    return;
  }
  if (req.method === "PUT" && slug) {
    const mapped = mapServiceBody((req as any).body);
    supa.from("services").update(mapped).eq("slug", slug).select().single().then(({ data }) => json(res, 200, { service: data }));
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
    const mapped = mapHomamBody((req as any).body);
    supa.from("homams").insert(mapped).select().single().then(({ data }) => json(res, 201, { homam: data }));
    return;
  }
  if (req.method === "PUT" && slug) {
    const mapped = mapHomamBody((req as any).body);
    supa.from("homams").update(mapped).eq("slug", slug).select().single().then(({ data }) => json(res, 200, { homam: data }));
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
    const mapped = mapAstrologerBody((req as any).body);
    supa.from("astrologers").insert(mapped).select().single().then(({ data }) => json(res, 201, { astrologer: data }));
    return;
  }
  if (req.method === "PUT") {
    const body = (req as any).body;
    const mapped = mapAstrologerBody(body);
    const id = body.id;
    if (!id) return json(res, 400, { error: "ID required" });
    supa.from("astrologers").update(mapped).eq("id", id).select().single().then(({ data }) => json(res, 200, { astrologer: data }));
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
    const mapped = mapTestimonialBody((req as any).body);
    supa.from("testimonials").insert(mapped).select().single().then(({ data }) => json(res, 201, { testimonial: data }));
    return;
  }
  if (req.method === "PUT") {
    const body = (req as any).body;
    const mapped = mapTestimonialBody(body);
    const id = body.id;
    if (!id) return json(res, 400, { error: "ID required" });
    supa.from("testimonials").update(mapped).eq("id", id).select().single().then(({ data }) => json(res, 200, { testimonial: data }));
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
    const content = (req as any).body;
    const title = content.title || slug;
    supa.from("pages").upsert({ slug, title, content, active: true }, { onConflict: "slug" }).select().single().then(({ data }) => json(res, 200, { page: data }));
    return;
  }
  json(res, 405, { error: "Method not allowed" });
}

function handleAdminUpload(req: VercelRequest, res: VercelResponse) {
  json(res, 501, { error: "Upload not implemented" });
}

// ─── Chat handler ───────────────────────────────────────────────────────────

const ASTROLOGY_SYSTEM_PROMPT = `You are Guruji Assistant, a knowledgeable Vedic astrology guide. You answer questions about: Vedic astrology, birth charts (kundli/jataka), rashi (moon sign), doshas (Manglik, Pitra, Rahu-Ketu), homams and rituals, gemstones, planetary periods (dashas), nakshatras, matchmaking (jataka/kundali matching), career guidance through astrology, health astrology, remedies (upayas), and spiritual practices from Vedic tradition.

Rules:
- ONLY answer questions related to Vedic astrology, spirituality, and the above topics.
- If asked about anything unrelated (sports, politics, technology, entertainment, etc.), politely redirect: "I can only guide you on Vedic astrology topics. Please ask me about your birth chart, doshas, homams, remedies, or any astrology-related question."
- Be warm, respectful, and use traditional Indian greeting style where appropriate. Use "Namaste" occasionally.
- Keep responses concise (2-4 short paragraphs max) since this is a chat interface.
- Give practical, actionable guidance when possible — mention specific mantras, simple remedies, or next steps.
- Never make guarantees about future events. Use phrases like "may help", "traditionally believed to", "often indicates".
- Do NOT provide medical advice. For health concerns, suggest consulting a doctor and mention relevant astrological remedies as complementary guidance only.
- If you don't know something specific, admit it honestly and suggest consulting Guruji directly for personalized analysis.
- The user may mention a specific service they are interested in. Keep your answers relevant to that service when they do.`;

async function callGemini(model: string, messages: any[]): Promise<string> {
  const contents = [
    { role: "user", parts: [{ text: ASTROLOGY_SYSTEM_PROMPT }] },
    ...messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  ];
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 512 } }),
    }
  );
  if (!resp.ok) throw new Error(`Gemini error: ${resp.status}`);
  const data = await resp.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "I couldn't generate a response. Please try again.";
}

async function callOpenAI(model: string, messages: any[]): Promise<string> {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: ASTROLOGY_SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 512,
    }),
  });
  if (!resp.ok) throw new Error(`OpenAI error: ${resp.status}`);
  const data = await resp.json();
  return data?.choices?.[0]?.message?.content?.trim() || "I couldn't generate a response. Please try again.";
}

async function handleChat(req: VercelRequest, res: VercelResponse) {
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

  const history = serviceTitle
    ? [
        ...clean.slice(0, -1),
        {
          role: "user",
          content: `[Context: The user is asking about the service "${serviceTitle}". Answer accordingly.]\n${clean[clean.length - 1].content}`,
        },
      ]
    : clean;

  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  if (!hasGemini && !hasOpenAI) return json(res, 503, { error: "The AI service is not configured." });

  try {
    let reply: string;
    const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const openaiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (hasGemini) {
      try {
        reply = await callGemini(geminiModel, history);
      } catch {
        reply = hasOpenAI
          ? await callOpenAI(openaiModel, history)
          : "I'm having trouble connecting right now. Please speak directly with Guruji at +91 98861 00565 for personalized guidance.";
      }
    } else if (hasOpenAI) {
      try {
        reply = await callOpenAI(openaiModel, history);
      } catch {
        reply = "I'm having trouble connecting right now. Please speak directly with Guruji at +91 98861 00565 for personalized guidance.";
      }
    } else {
      reply = "The AI service is not configured. Please speak directly with Guruji at +91 98861 00565 for personalized guidance.";
    }

    if (!res.writableEnded) {
      json(res, 200, { reply });
    }
  } catch {
    if (!res.writableEnded) {
      json(res, 500, { error: "Something went wrong. Please try again." });
    }
  }
}

// ─── Auth handler ───────────────────────────────────────────────────────────

function handleAuth(req: VercelRequest, res: VercelResponse) {
  const pathArr = (req.query as any).path || [];
  const parts = Array.isArray(pathArr)
    ? pathArr.filter(Boolean)
    : String(pathArr).split("/").filter(Boolean);
  const action = parts[1] || parts[0] || "";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  corsHeaders(res, req);
  if (req.method === "OPTIONS") return res.status(200).end();

  const pathArr = (req.query as any).path || [];
  const parts = Array.isArray(pathArr)
    ? pathArr.filter(Boolean)
    : String(pathArr).split("/").filter(Boolean);

  // /api/public/services, /api/public/homams, etc.
  if (parts[0] === "public" && req.method === "GET") {
    const [group, resource, slug] = [parts[1], parts[2], parts[3]];
    if (group === "services") return publicServices(res, req);
    if (group === "homams") return publicHomams(res, req);
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

  // /api/chat — needs async for AI calls
  if (parts[0] === "chat") {
    await handleChat(req, res);
    return;
  }

  // /api/enquiry (singular) and /api/enquiries — form submissions with email notifications
  if ((parts[0] === "enquiry" || parts[0] === "enquiries") && req.method === "POST") {
    const body = (req as any).body || {};
    const variant = body.variant || "contact";

    // Map camelCase form fields → snake_case DB columns; drop unknown fields
    const dbRow: Record<string, unknown> = {
      reference: `VA-${Date.now().toString(36).toUpperCase()}`,
      variant,
      subject: body.subject || "",
      name: body.name || "",
      phone: body.phone || "",
      email: body.email || null,
      dob: body.dob || null,
      tob: body.tob || null,
      pob: body.pob || null,
      gender: body.gender || null,
      preferred_mode: body.preferredMode || body.preferred_mode || null,
      preferred_date: body.preferredDate || body.preferred_date || null,
      message: body.message || null,
      service_interested: body.serviceInterested || body.service_interested || null,
      preferred_contact: body.preferredContact || body.preferred_contact || null,
      status: "new",
    };

    // Save to database
    const { data: enquiry, error: dbError } = await supa
      .from("enquiries")
      .insert(dbRow)
      .select()
      .single();

    if (dbError) {
      const msg = dbError.message || "Database error";
      console.error("[enquiry] DB insert failed:", dbError);
      return json(res, 503, { error: msg });
    }

    const reference = dbRow.reference as string;

    // Send admin notification email
    const typeLabel = variant === "homam" ? "Homam Booking" : variant === "consultation" ? "Consultation" : "Enquiry";
    const adminHtml = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#b45309;">New ${typeLabel} — ${reference}</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:6px 0;color:#888;width:140px;">Name</td><td style="padding:6px 0;font-weight:bold;">${body.name || ""}</td></tr>
    <tr><td style="padding:6px 0;color:#888;width:140px;">Phone</td><td style="padding:6px 0;">${body.phone || ""}</td></tr>
    ${body.email ? `<tr><td style="padding:6px 0;color:#888;width:140px;">Email</td><td style="padding:6px 0;">${body.email}</td></tr>` : ""}
    ${body.subject ? `<tr><td style="padding:6px 0;color:#888;width:140px;">Service</td><td style="padding:6px 0;">${body.subject}</td></tr>` : ""}
    ${body.dob ? `<tr><td style="padding:6px 0;color:#888;width:140px;">Date of Birth</td><td style="padding:6px 0;">${body.dob}</td></tr>` : ""}
    ${body.tob ? `<tr><td style="padding:6px 0;color:#888;width:140px;">Time of Birth</td><td style="padding:6px 0;">${body.tob}</td></tr>` : ""}
    ${body.pob ? `<tr><td style="padding:6px 0;color:#888;width:140px;">Place of Birth</td><td style="padding:6px 0;">${body.pob}</td></tr>` : ""}
    ${body.message ? `<tr><td style="padding:6px 0;color:#888;vertical-align:top;">Message</td><td style="padding:6px 0;">${body.message}</td></tr>` : ""}
  </table>
  <p style="margin-top:20px;color:#666;font-size:12px;">View in admin: <a href="${process.env.FRONTEND_URL || 'https://myvedicastrology.in'}/admin/enquiries">Admin Panel → Enquiries</a></p>
</div>`;

    // Fire-and-forget email (don't block the response)
    sendEmailDirect({
      to: "info@myvedicastrology.in",
      subject: `New ${typeLabel}: ${body.name || "Customer"} — ${reference}`,
      html: adminHtml,
    }).catch(() => {});

    // Send customer confirmation if email provided
    if (body.email) {
      const customerHtml = `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fffbf0;border:1px solid #e9c97e;border-radius:12px;overflow:hidden;">
  <div style="background:#b45309;padding:28px 32px;">
    <h1 style="margin:0;color:white;font-size:22px;letter-spacing:0.5px;">ॐ My Vedic Astrology</h1>
    <p style="margin:8px 0 0;color:#ffe9b3;font-size:13px;">Sampath Kumara Guruji · Bangalore</p>
  </div>
  <div style="padding:28px 32px;">
    <p style="font-size:16px;color:#1c1010;">Namaste, <strong>${body.name || "Valued Customer"}</strong> 🙏</p>
    <p style="color:#4b3320;line-height:1.7;">Thank you for reaching out to My Vedic Astrology. We have received your request for <strong>${body.subject || "our services"}</strong> and Guruji will review your details and get back to you shortly.</p>
    <div style="background:#fef3c7;border-left:4px solid #b45309;padding:14px 18px;margin:20px 0;border-radius:0 8px 8px 0;">
      <p style="margin:0;font-size:12px;color:#7c4a00;text-transform:uppercase;letter-spacing:0.08em;">Your Reference Number</p>
      <p style="margin:0;font-size:28px;font-weight:bold;letter-spacing:4px;color:#b45309;font-family:monospace;">${reference}</p>
      <p style="margin:6px 0 0;font-size:12px;color:#7c4a00;">Please keep this safe for follow-up</p>
    </div>
    <p style="color:#4b3320;line-height:1.7;">Guruji will reach out to you within 24–48 hours via phone or email. For urgent queries, call <a href="tel:+919886100565" style="color:#b45309;">+91 98861 00565</a>.</p>
    <p style="margin-top:24px;color:#4b3320;">With blessings,<br/><strong style="color:#b45309;">Sampath Kumara Guruji</strong><br/>My Vedic Astrology · Bangalore<br/><a href="https://myvedicastrology.in" style="color:#b45309;">myvedicastrology.in</a></p>
  </div>
</div>`;

      sendEmailDirect({
        to: body.email,
        subject: `Your Enquiry Confirmation — ${reference} | My Vedic Astrology`,
        html: customerHtml,
      }).catch(() => {});
    }

    return json(res, 201, { ok: true, reference, enquiry });
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
 
